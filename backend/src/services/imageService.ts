import sharp from "sharp";
import path from "path";
import crypto from "crypto";

export interface ProcessedImage {
  buffer: Buffer;
  key: string;
  format: string;
  width?: number;
  height?: number;
  sizeBytes: number;
}

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  lossless?: boolean;
}

export class ImageService {
  /**
   * Generates a date-based partitioned key for consistent storage across any provider.
   * Format: uploads/{folder}/YYYY/MM/{randomHash}.webp
   */
  static generateStorageKey(folder: string = "news", customName?: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const randomHash = crypto.randomBytes(8).toString("hex");
    const timestamp = Date.now();

    const sanitizedName = customName
      ? customName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .substring(0, 30)
      : "";

    const filename = sanitizedName ? `${timestamp}-${sanitizedName}-${randomHash}.webp` : `${timestamp}-${randomHash}.webp`;

    return `uploads/${folder}/${year}/${month}/${filename}`;
  }

  /**
   * Optimizes an image buffer into high quality .webp
   */
  static async optimizeToWebp(
    inputBuffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<Buffer> {
    const { maxWidth = 1920, maxHeight = 1080, quality = 82 } = options;

    let pipeline = sharp(inputBuffer).rotate(); // auto-orient based on EXIF

    const metadata = await pipeline.metadata();

    // Resize only if image is larger than target limits
    if (
      (metadata.width && metadata.width > maxWidth) ||
      (metadata.height && metadata.height > maxHeight)
    ) {
      pipeline = pipeline.resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true
      });
    }

    return await pipeline
      .webp({
        quality,
        effort: 4, // 0-6 (4 is optimal trade-off for speed vs compression)
        smartSubsample: true
      })
      .toBuffer();
  }

  /**
   * Generates a responsive thumbnail (e.g. for news listing card)
   */
  static async createThumbnail(
    inputBuffer: Buffer,
    width: number = 480,
    height: number = 270,
    quality: number = 78
  ): Promise<Buffer> {
    return await sharp(inputBuffer)
      .rotate()
      .resize({
        width,
        height,
        fit: "cover",
        position: "center"
      })
      .webp({ quality })
      .toBuffer();
  }

  /**
   * Complete optimization pipeline for incoming uploads:
   * Returns primary webp image and optional thumbnail.
   */
  static async processNewsImage(
    fileBuffer: Buffer,
    originalName?: string,
    folder: string = "news"
  ): Promise<{
    main: ProcessedImage;
    thumbnail?: ProcessedImage;
  }> {
    // 1. Optimize Main Image
    const mainBuffer = await this.optimizeToWebp(fileBuffer, {
      maxWidth: 1600,
      quality: 82
    });

    const mainMetadata = await sharp(mainBuffer).metadata();
    const mainKey = this.generateStorageKey(folder, originalName ? path.parse(originalName).name : undefined);

    const main: ProcessedImage = {
      buffer: mainBuffer,
      key: mainKey,
      format: "webp",
      width: mainMetadata.width,
      height: mainMetadata.height,
      sizeBytes: mainBuffer.length
    };

    // 2. Generate Thumbnail (Optional / Complementary)
    const thumbBuffer = await this.createThumbnail(fileBuffer, 500, 280, 80);
    const thumbMetadata = await sharp(thumbBuffer).metadata();
    const thumbKey = mainKey.replace(".webp", "-thumb.webp");

    const thumbnail: ProcessedImage = {
      buffer: thumbBuffer,
      key: thumbKey,
      format: "webp",
      width: thumbMetadata.width,
      height: thumbMetadata.height,
      sizeBytes: thumbBuffer.length
    };

    return { main, thumbnail };
  }
}

export default ImageService;
