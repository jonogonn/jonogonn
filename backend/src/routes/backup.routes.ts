import { Router, Request, Response } from "express";
import { BackupService } from "../services/backupService";
import { primaryDb } from "../config/db";

const backupRouter = Router();

/**
 * POST /api/backup/trigger
 * Workflow:
 * 1. MariaDB SQL Dump
 * 2. Primary Backup -> Admin Backblaze B2
 * 3. Final Backup -> Secondary MariaDB
 */
backupRouter.post("/trigger", async (_req: Request, res: Response): Promise<any> => {
  try {
    const result = await BackupService.executeFullBackup();

    // Log to DB
    try {
      if (result.primaryBackup.success) {
        await primaryDb.query(
          `INSERT INTO backup_logs (backup_type, destination, file_key, status) VALUES (?, ?, ?, ?)`,
          ["primary_dump", "Admin Backblaze B2", result.primaryBackup.key || "", "success"]
        );
      }
      if (result.finalBackup.success) {
        await primaryDb.query(
          `INSERT INTO backup_logs (backup_type, destination, file_key, status) VALUES (?, ?, ?, ?)`,
          ["secondary_replica", "Secondary MariaDB", "database_sync", "success"]
        );
      }
    } catch (logErr: any) {
      console.warn("Could not log backup entry to DB:", logErr.message);
    }

    return res.status(200).json({
      success: result.primaryBackup.success || result.finalBackup.success,
      message: "Backup workflow executed",
      data: result
    });
  } catch (err: any) {
    console.error("Backup execution failed:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to execute backup workflow"
    });
  }
});

export default backupRouter;
