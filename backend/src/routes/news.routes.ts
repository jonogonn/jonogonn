import { Router, Request, Response } from "express";
import { primaryDb } from "../config/db";
import { buildCdnUrl } from "../config/storage.config";

const newsRouter = Router();

/**
 * GET /api/news
 * Public News Feed: Fetches news from MariaDB and maps image keys to Cloudflare CDN URLs
 */
newsRouter.get("/", async (_req: Request, res: Response): Promise<any> => {
  try {
    let rows: any[] = [];
    try {
      const [postRows]: any = await primaryDb.query(
        `SELECT * FROM news_posts ORDER BY created_at DESC LIMIT 50`
      );
      rows = postRows;
    } catch (e) {
      const [legacyRows]: any = await primaryDb.query(
        `SELECT * FROM news ORDER BY created_at DESC LIMIT 50`
      );
      rows = legacyRows;
    }

    // Transform stored relative keys to full CDN URLs dynamically
    const newsWithCdnImages = rows.map((item: any) => ({
      ...item,
      featured_image_url: buildCdnUrl(item.featured_image),
      thumbnail_image_url: buildCdnUrl(item.thumbnail_image)
    }));

    return res.status(200).json({
      success: true,
      count: newsWithCdnImages.length,
      data: newsWithCdnImages
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch news"
    });
  }
});

/**
 * POST /api/news
 * Admin Endpoint: Saves News Text & Relative Image Storage Key into MariaDB
 */
newsRouter.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, content, excerpt, category_id, featured_image, thumbnail_image, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    const slug =
      req.body.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
        .replace(/^-+|-+$/g, "") + `-${Date.now()}`;

    const [result]: any = await primaryDb.query(
      `INSERT INTO news (title, slug, category_id, excerpt, content, featured_image, thumbnail_image, author)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        category_id || null,
        excerpt || null,
        content,
        featured_image || null, // Stores relative path: uploads/news/2026/10/xyz.webp
        thumbnail_image || null,
        author || "Janogon Desk"
      ]
    );

    return res.status(201).json({
      success: true,
      message: "News article saved to MariaDB successfully",
      data: {
        id: result.insertId,
        title,
        slug,
        featured_image_url: buildCdnUrl(featured_image),
        thumbnail_image_url: buildCdnUrl(thumbnail_image)
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save news"
    });
  }
});

export default newsRouter;
