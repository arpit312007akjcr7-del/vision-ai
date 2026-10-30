import { z } from "zod";

export const inspectionRequestSchema = z.object({
  domain: z.string().min(2).max(100),
  userId: z.number().int().positive().default(1),
  notes: z.string().optional().default(""),
  enableBoundingBoxes: z.boolean().optional().default(true),
  strictnessLevel: z.enum(["low", "medium", "high"]).optional().default("medium"),
  customPromptOverride: z.string().optional().default(""),
  image: z.string().min(10, "Image data or URL is required"), // Base64 data URL or remote URL
  mimeType: z.string().optional().default("image/jpeg"),
});

export const detectedObjectSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(100),
  box_2d: z.array(z.number()).length(4), // [ymin, xmin, ymax, xmax] normalized 0-1000
  details: z.string().default(""),
  severity: z.enum(["normal", "low", "medium", "high", "critical"]).optional().default("normal"),
  category: z.string().optional().default("object"),
});

export const aiResponseSchema = z.object({
  summary: z.string(),
  overallConfidence: z.number().min(0).max(100),
  detectedObjects: z.array(detectedObjectSchema),
  anomaliesDetected: z.boolean().optional().default(false),
  inspectionVerdict: z.enum(["PASS", "WARN", "FAIL", "FLAGGED", "INCONCLUSIVE"]).optional().default("PASS"),
  domainInsights: z.array(z.string()).optional().default([]),
});

export type InspectionRequest = z.infer<typeof inspectionRequestSchema>;
export type DetectedObject = z.infer<typeof detectedObjectSchema>;
export type AIResponse = z.infer<typeof aiResponseSchema>;
