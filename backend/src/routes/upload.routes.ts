import { Router, Request, Response } from "express";
import multer from "multer";
import { storageService } from "../services/storageService";
import { primaryDb } from "../config/db";

const uploadRouter = Router();

// Configure Multer in-memory storage (processes directly in RAM with Sharp)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max input limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

/**
 * POST /api/upload/image
 * Workflow: Input Image -> Sharp WebP Optimization -> Backblaze B2 -> Returns CDN Link
 */
uploadRouter.post(
  "/image",
  upload.single("image"),
  async (req: Request, res: Response): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file provided" });
      }

      const folder = (req.body.folder as string) || "news";
      const result = await storageService.processAndUploadNewsImage(
        req.file.buffer,
        req.file.originalname,
        folder
      );

      // Save upload metadata in MariaDB
      try {
        await primaryDb.query(
          `INSERT INTO media_uploads (original_name, storage_key, file_format, size_bytes, width, height, provider)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            req.file.originalname,
            result.main.key,
            "webp",
            result.main.sizeBytes,
            result.main.width || null,
            result.main.height || null,
            storageService.getProviderName()
          ]
        );
      } catch (dbErr: any) {
        console.warn("Could not save media record to DB:", dbErr.message);
      }

      return res.status(200).json({
        success: true,
        message: "Image optimized to WebP and uploaded successfully",
        data: {
          key: result.main.key,
          cdnUrl: result.main.cdnUrl,
          directUrl: result.main.url,
          width: result.main.width,
          height: result.main.height,
          sizeBytes: result.main.sizeBytes,
          thumbnail: result.thumbnail
            ? {
                key: result.thumbnail.key,
                cdnUrl: result.thumbnail.cdnUrl
              }
            : undefined
        }
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to process and upload image"
      });
    }
  }
);

export default uploadRouter;
