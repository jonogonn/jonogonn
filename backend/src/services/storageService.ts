import { storageConfig, buildCdnUrl } from "../config/storage.config";
import { IStorageProvider, UploadResult } from "./storage/IStorageProvider";
import { B2Service, b2Service } from "./b2Service";
import { ImageService, ProcessedImage } from "./imageService";

/**
 * Storage Service Factory & Facade
 * All assets upload directly to Backblaze B2 Cloud Storage (zero local disk storage).
 */
class StorageService {
  private provider: IStorageProvider;

  constructor() {
    this.provider = b2Service;
    if (
      !storageConfig.credentials.accessKeyId ||
      !storageConfig.credentials.secretAccessKey
    ) {
      console.warn(
        "⚠️ Warning: Backblaze B2 credentials not fully set in .env. Cloud uploads will require credentials."
      );
    }
  }

  /**
   * Switch provider at runtime if required
   */
  setProvider(provider: IStorageProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  /**
   * Uploads raw buffer to active storage provider
   */
  async upload(
    key: string,
    buffer: Buffer,
    contentType: string = "image/webp",
    bucketOverride?: string
  ): Promise<UploadResult> {
    return this.provider.upload(key, buffer, contentType, bucketOverride);
  }

  /**
   * Complete End-to-End Workflow for News Images:
   * 1. Optimize input image with Sharp -> .webp
   * 2. Upload WebP to Backblaze B2 (or active provider)
   * 3. Return relative key (for MariaDB) and full Cloudflare CDN URL (for janogon.news)
   */
  async processAndUploadNewsImage(
    fileBuffer: Buffer,
    originalName?: string,
    folder: string = "news"
  ): Promise<{
    main: UploadResult & { width?: number; height?: number };
    thumbnail?: UploadResult & { width?: number; height?: number };
  }> {
    // Step 1: Optimize with Sharp to WebP
    const { main, thumbnail } = await ImageService.processNewsImage(
      fileBuffer,
      originalName,
      folder
    );

    // Step 2: Upload Main Image to Storage
    const mainUpload = await this.provider.upload(
      main.key,
      main.buffer,
      "image/webp"
    );

    let thumbUpload: (UploadResult & { width?: number; height?: number }) | undefined;

    // Step 3: Upload Thumbnail if generated
    if (thumbnail) {
      const res = await this.provider.upload(
        thumbnail.key,
        thumbnail.buffer,
        "image/webp"
      );
      thumbUpload = {
        ...res,
        width: thumbnail.width,
        height: thumbnail.height
      };
    }

    return {
      main: {
        ...mainUpload,
        width: main.width,
        height: main.height
      },
      thumbnail: thumbUpload
    };
  }

  /**
   * Resolves any stored DB key to a full Cloudflare CDN URL
   */
  getImageUrl(key: string): string {
    return buildCdnUrl(key);
  }

  /**
   * Delete image from storage
   */
  async delete(key: string, bucketOverride?: string): Promise<boolean> {
    return this.provider.delete(key, bucketOverride);
  }
}

export const storageService = new StorageService();
export default storageService;
