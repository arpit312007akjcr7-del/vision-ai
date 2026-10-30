import { Router, Request, Response } from "express";
import { db } from "../db/pool.js";

const router = Router();

// GET /api/analytics/summary - Get aggregated inspection metrics
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 1;
    const summary = await db.getAnalyticsSummary(userId);
    res.json(summary);
  } catch (error: any) {
    console.error("Error generating analytics summary:", error);
    res.status(500).json({ error: "Failed to load analytics", details: error.message });
  }
});

// GET /api/users/current - Get current user profile
router.get("/user", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 1;
    const user = await db.getCurrentUser(userId);
    res.json(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to load user profile", details: error.message });
  }
});

export default router;
