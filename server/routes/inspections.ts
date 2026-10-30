import { Router, Request, Response } from "express";
import { db } from "../db/pool.js";
import { inspectionRequestSchema } from "../schemas/validation.js";
import { analyzeImage } from "../services/gemini.js";

const router = Router();

// GET /api/inspections - List paginated inspections
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 1;
    const domain = req.query.domain as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "10", 10)));

    const result = await db.getInspections({
      userId,
      domain,
      search,
      page,
      limit,
    });

    res.json(result);
  } catch (error: any) {
    console.error("Error fetching inspections:", error);
    res.status(500).json({ error: "Failed to retrieve inspections", details: error.message });
  }
});

// GET /api/inspections/:id - Get single inspection report
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid inspection ID" });
    }

    const userId = Number(req.query.userId) || 1;
    const inspection = await db.getInspectionById(id, userId);

    if (!inspection) {
      return res.status(404).json({ error: "Inspection not found" });
    }

    res.json(inspection);
  } catch (error: any) {
    console.error("Error fetching inspection details:", error);
    res.status(500).json({ error: "Failed to retrieve inspection", details: error.message });
  }
});

// POST /api/inspections - Run visual analysis and save
router.post("/", async (req: Request, res: Response) => {
  try {
    const parseResult = inspectionRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: parseResult.error.format(),
      });
    }

    const {
      domain,
      userId,
      notes,
      enableBoundingBoxes,
      strictnessLevel,
      customPromptOverride,
      image,
      mimeType,
    } = parseResult.data;

    // Run AI multimodal analysis
    const aiResult = await analyzeImage({
      domain,
      imageData: image,
      mimeType,
      notes,
      enableBoundingBoxes,
      strictnessLevel,
      customPromptOverride,
    });

    // Save image reference or data URL
    // For large uploads, we keep the data URL or image url
    const imageUrlToSave = image.startsWith("data:")
      ? image // Store data URL for canvas rendering
      : image;

    // Persist to database
    const createdInspection = await db.createInspection({
      userId,
      imageUrl: imageUrlToSave,
      domain,
      summary: aiResult.summary,
      rawAiResponse: aiResult,
      confidenceScore: aiResult.overallConfidence,
      detectedObjects: aiResult.detectedObjects,
    });

    res.status(201).json({
      success: true,
      inspection: createdInspection,
      aiAnalysis: aiResult,
    });
  } catch (error: any) {
    console.error("Error executing inspection analysis:", error);
    res.status(500).json({
      error: "Analysis failed",
      message: error.message || "An unexpected error occurred during visual inspection",
    });
  }
});

// DELETE /api/inspections/:id - Delete an inspection
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid inspection ID" });
    }

    const userId = Number(req.query.userId) || 1;
    const deleted = await db.deleteInspection(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: "Inspection not found or already deleted" });
    }

    res.json({ success: true, message: "Inspection deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting inspection:", error);
    res.status(500).json({ error: "Failed to delete inspection", details: error.message });
  }
});

export default router;
