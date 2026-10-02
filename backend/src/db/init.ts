import { primaryDb } from "../config/db";

export async function initDatabase() {
  try {
    const conn = await primaryDb.getConnection();

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS news (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        category_id INT NULL,
        excerpt TEXT NULL,
        content LONGTEXT NOT NULL,
        featured_image VARCHAR(255) NULL,
        thumbnail_image VARCHAR(255) NULL,
        author VARCHAR(100) DEFAULT 'Janogon Desk',
        status ENUM('draft', 'published', 'archived') DEFAULT 'published',
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS media_uploads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_name VARCHAR(255) NULL,
        storage_key VARCHAR(255) NOT NULL UNIQUE,
        file_format VARCHAR(20) DEFAULT 'webp',
        size_bytes INT UNSIGNED NOT NULL,
        width INT UNSIGNED NULL,
        height INT UNSIGNED NULL,
        provider VARCHAR(50) DEFAULT 'b2',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS backup_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        backup_type VARCHAR(50) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        file_key VARCHAR(255) NULL,
        status ENUM('success', 'failed') NOT NULL,
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    conn.release();
    console.log("✅ MariaDB Tables checked/initialized successfully.");
  } catch (err: any) {
    console.warn("⚠️ Database auto-initialization skipped or failed:", err.message);
  }
}
