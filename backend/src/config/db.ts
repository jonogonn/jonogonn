import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

/**
 * Primary MariaDB Connection Pool
 */
export const primaryDb = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "janogon_db",
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Secondary / Replica MariaDB Pool (For Final Backup & Sync)
 */
export const secondaryDb = mysql.createPool({
  host: process.env.BACKUP_DB_HOST || "localhost",
  port: parseInt(process.env.BACKUP_DB_PORT || "3306", 10),
  user: process.env.BACKUP_DB_USER || "root",
  password: process.env.BACKUP_DB_PASSWORD || "",
  database: process.env.BACKUP_DB_NAME || "janogon_db_backup",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

/**
 * Test DB Connection helper
 */
export async function testDbConnections(): Promise<{ primary: boolean; secondary: boolean; error?: string }> {
  let primaryConnected = false;
  let secondaryConnected = false;

  try {
    const conn = await primaryDb.getConnection();
    await conn.ping();
    conn.release();
    primaryConnected = true;
    console.log("✅ Primary MariaDB Connected successfully.");
  } catch (err: any) {
    console.warn("⚠️ Primary MariaDB connection failed:", err.message);
  }

  try {
    const conn = await secondaryDb.getConnection();
    await conn.ping();
    conn.release();
    secondaryConnected = true;
    console.log("✅ Secondary MariaDB Connected successfully.");
  } catch (err: any) {
    console.warn("⚠️ Secondary MariaDB connection failed (Optional replica):", err.message);
  }

  return { primary: primaryConnected, secondary: secondaryConnected };
}

export default primaryDb;
