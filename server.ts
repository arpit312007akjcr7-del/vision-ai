import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initDatabase } from "./server/db/pool.js";
import inspectionsRouter from "./server/routes/inspections.js";
import analyticsRouter from "./server/routes/analytics.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3000", 10);
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();

  // Initialize DB (Postgres or local persistence)
  await initDatabase();

  // Security headers configured to support AI Studio iFrame and Vite Dev HMR
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      frameguard: false, // Allow AI Studio iframe preview
    })
  );

  app.use(cors());

  // Increased body limit for base64 image data (up to 50MB)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Routes
  app.use("/api/inspections", inspectionsRouter);
  app.use("/api/analytics", analyticsRouter);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "VisionAI Core Platform",
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  if (!isProduction) {
    // Mount Vite dev server middleware
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
    console.log("Vite dev middleware attached.");
  } else {
    // Serve static files from dist in production
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VisionAI Core server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server error on startup:", err);
  process.exit(1);
});
