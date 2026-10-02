import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { storageConfig, buildCdnUrl } from "../config/storage.config";
import { IStorageProvider, UploadResult } from "./storage/IStorageProvider";
import { Readable } from "stream";

/**
 * BackBlaze B2 / S3-Compatible Storage Provider
 * Works seamlessly with Backblaze B2, Cloudflare R2, AWS S3, Wasabi, MinIO, etc.
 */
export class B2Service implements IStorageProvider {
  public name = "Backblaze B2 (S3-Compatible)";
  private client: S3Client;
  private defaultBucket: string;
  private backupBucket: string;

  constructor() {
    this.defaultBucket = storageConfig.bucketName;
    this.backupBucket = storageConfig.backupBucketName;

    this.client = new S3Client({
      endpoint: storageConfig.endpoint,
      region: storageConfig.region || "us-east-1",
      credentials: {
        accessKeyId: storageConfig.credentials.accessKeyId,
        secretAccessKey: storageConfig.credentials.secretAccessKey
      },
      forcePathStyle: true // Recommended for B2 & MinIO S3 compatibility
    });
  }

  /**
   * Upload an optimized WebP or asset to Backblaze B2 bucket
   */
  async upload(
    key: string,
    buffer: Buffer,
    contentType: string = "image/webp",
    bucketOverride?: string
  ): Promise<UploadResult> {
    const bucket = bucketOverride || this.defaultBucket;
    const cleanKey = key.replace(/^\/+/, "");

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: cleanKey,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable" // 1 year caching
    });

    await this.client.send(command);

    const cdnUrl = buildCdnUrl(cleanKey);
    const directUrl = `${storageConfig.endpoint}/${bucket}/${cleanKey}`;

    return {
      key: cleanKey,
      url: directUrl,
      cdnUrl: cdnUrl,
      sizeBytes: buffer.length,
      contentType
    };
  }

  /**
   * Upload to Admin Backblaze B2 Backup bucket
   */
  async uploadBackup(
    backupKey: string,
    data: Buffer | string,
    contentType: string = "application/sql"
  ): Promise<UploadResult> {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf-8");
    return this.upload(backupKey, buffer, contentType, this.backupBucket);
  }

  /**
   * Delete an object from Backblaze B2
   */
  async delete(key: string, bucketOverride?: string): Promise<boolean> {
    const bucket = bucketOverride || this.defaultBucket;
    const cleanKey = key.replace(/^\/+/, "");

    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: cleanKey
      });
      await this.client.send(command);
      return true;
    } catch (err) {
      console.error(`Error deleting object ${cleanKey} from B2:`, err);
      return false;
    }
  }

  /**
   * Get the full CDN URL for a stored key
   */
  getUrl(key: string): string {
    return buildCdnUrl(key);
  }

  /**
   * Download a file from B2 as a Buffer
   */
  async download(key: string, bucketOverride?: string): Promise<Buffer> {
    const bucket = bucketOverride || this.defaultBucket;
    const cleanKey = key.replace(/^\/+/, "");

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: cleanKey
    });

    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error(`Empty body returned for ${cleanKey}`);
    }

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
  }
}

// Default export instance
export const b2Service = new B2Service();
export default b2Service;
