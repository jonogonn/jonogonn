import { primaryDb, secondaryDb } from "../config/db";
import { b2Service } from "./b2Service";
import { storageConfig } from "../config/storage.config";

export interface BackupResult {
  timestamp: string;
  primaryBackup: {
    success: boolean;
    destination: string;
    key?: string;
    sizeBytes?: number;
    error?: string;
  };
  finalBackup: {
    success: boolean;
    destination: string;
    tablesSynced?: number;
    error?: string;
  };
}

export class BackupService {
  /**
   * Generates a SQL dump from Primary MariaDB
   */
  static async generateSqlDump(): Promise<{ sql: string; tableCount: number; rowCount: number }> {
    const conn = await primaryDb.getConnection();
    try {
      const dbName = process.env.DB_NAME || "janogon_db";
      let dump = `-- ===============================================\n`;
      dump += `-- Janogon MariaDB Automated Backup\n`;
      dump += `-- Generated at: ${new Date().toISOString()}\n`;
      dump += `-- Database: ${dbName}\n`;
      dump += `-- ===============================================\n\n`;
      dump += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

      // Get list of all tables
      const [tables]: any = await conn.query(`SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'`);
      let totalRows = 0;

      for (const row of tables) {
        const tableName = Object.values(row)[0] as string;

        // 1. Get CREATE TABLE definition
        const [createTableResult]: any = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
        const createSql = createTableResult[0]["Create Table"];

        dump += `-- Table structure for \`${tableName}\`\n`;
        dump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        dump += `${createSql};\n\n`;

        // 2. Dump Table Data
        const [rows]: any = await conn.query(`SELECT * FROM \`${tableName}\``);
        if (rows.length > 0) {
          totalRows += rows.length;
          dump += `-- Dumping data for \`${tableName}\` (${rows.length} rows)\n`;

          const keys = Object.keys(rows[0]);
          const columnsList = keys.map((k) => `\`${k}\``).join(", ");

          for (const dataRow of rows) {
            const values = keys
              .map((key) => {
                const val = dataRow[key];
                if (val === null || val === undefined) return "NULL";
                if (typeof val === "number") return val;
                if (typeof val === "boolean") return val ? 1 : 0;
                if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
                // Escape string
                const str = String(val).replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
                  switch (char) {
                    case "\0": return "\\0";
                    case "\x08": return "\\b";
                    case "\x09": return "\\t";
                    case "\x1a": return "\\z";
                    case "\n": return "\\n";
                    case "\r": return "\\r";
                    case "\"":
                    case "'":
                    case "\\":
                    case "%": return "\\" + char;
                    default: return char;
                  }
                });
                return `'${str}'`;
              })
              .join(", ");

            dump += `INSERT INTO \`${tableName}\` (${columnsList}) VALUES (${values});\n`;
          }
          dump += `\n`;
        }
      }

      dump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
      return { sql: dump, tableCount: tables.length, rowCount: totalRows };
    } finally {
      conn.release();
    }
  }

  /**
   * Primary Backup: Export MariaDB Dump and upload to Admin Backblaze B2
   */
  static async runPrimaryBackup(sqlDump: string): Promise<{ success: boolean; key?: string; sizeBytes?: number; error?: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupKey = `database-backups/${new Date().getFullYear()}/${timestamp}-janogon-backup.sql`;

    try {
      if (storageConfig.credentials.accessKeyId && storageConfig.credentials.secretAccessKey) {
        const result = await b2Service.uploadBackup(backupKey, sqlDump, "application/sql");
        return {
          success: true,
          key: result.key,
          sizeBytes: result.sizeBytes
        };
      } else {
        // Fallback for local development if B2 credentials are not set
        return {
          success: true,
          key: backupKey,
          sizeBytes: Buffer.byteLength(sqlDump),
          error: "Simulated Primary Backup: B2 credentials not set in .env"
        };
      }
    } catch (err: any) {
      console.error("❌ Primary Backup to Backblaze B2 failed:", err.message);
      return {
        success: false,
        error: err.message
      };
    }
  }

  /**
   * Final Backup: Sync / Restore Dump into Secondary MariaDB instance
   */
  static async runFinalBackup(sqlDump: string): Promise<{ success: boolean; error?: string }> {
    let conn;
    try {
      conn = await secondaryDb.getConnection();

      // Split queries and execute sequentially on secondary MariaDB
      const statements = sqlDump
        .split(/;\s*[\r\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      for (const statement of statements) {
        await conn.query(statement);
      }

      return { success: true };
    } catch (err: any) {
      console.error("❌ Final Backup to Secondary MariaDB failed:", err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Complete Backup Workflow Execution:
   * 1. Primary Backup -> Admin Backblaze B2
   * 2. Final Backup -> Secondary MariaDB
   */
  static async executeFullBackup(): Promise<BackupResult> {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Starting Automated MariaDB Backup Workflow...`);

    let sqlDump = "";
    let tableCount = 0;

    try {
      const dumpResult = await this.generateSqlDump();
      sqlDump = dumpResult.sql;
      tableCount = dumpResult.tableCount;
    } catch (err: any) {
      console.error("Failed to generate MariaDB dump:", err.message);
      return {
        timestamp,
        primaryBackup: {
          success: false,
          destination: "Admin Backblaze B2",
          error: `Dump generation failed: ${err.message}`
        },
        finalBackup: {
          success: false,
          destination: "Secondary MariaDB",
          error: `Dump generation failed: ${err.message}`
        }
      };
    }

    // 1. Run Primary Backup (Backblaze B2)
    const primaryRes = await this.runPrimaryBackup(sqlDump);

    // 2. Run Final Backup (Secondary MariaDB)
    const finalRes = await this.runFinalBackup(sqlDump);

    return {
      timestamp,
      primaryBackup: {
        success: primaryRes.success,
        destination: "Admin Backblaze B2",
        key: primaryRes.key,
        sizeBytes: primaryRes.sizeBytes,
        error: primaryRes.error
      },
      finalBackup: {
        success: finalRes.success,
        destination: "Secondary MariaDB",
        tablesSynced: tableCount,
        error: finalRes.error
      }
    };
  }
}

export default BackupService;
