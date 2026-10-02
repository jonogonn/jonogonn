import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { testDbConnections } from "./config/db";
import { initDatabase } from "./db/init";
import uploadRouter from "./routes/upload.routes";
import backupRouter from "./routes/backup.routes";
import newsRouter from "./routes/news.routes";
import { storageConfig } from "./config/storage.config";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploads folder statically for development fallback
app.use("/uploads", express.static(path.resolve(process.cwd(), "public", "uploads")));

// API Base Health Check
app.get("/api", (_req, res) => {
  res.json({
    success: true,
    message: "Janogon News API is running",
    storageProvider: storageConfig.provider,
    cdnBaseUrl: storageConfig.cdnBaseUrl || "Direct S3/Local",
    timestamp: new Date().toISOString()
  });
});

// Register Workflow Routes
app.use("/api/upload", uploadRouter);
app.use("/api/backup", backupRouter);
app.use("/api/news", newsRouter);

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Janogon Backend running on http://localhost:${PORT}`);
  console.log(`📦 Storage Config: Provider=${storageConfig.provider}, CDN=${storageConfig.cdnBaseUrl || "Not set"}`);
  
  // Test DB and initialize tables if needed
  await testDbConnections();
  await initDatabase();
});

export default app;
