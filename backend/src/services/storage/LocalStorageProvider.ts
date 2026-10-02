import fs from "fs/promises";
import path from "path";
import { IStorageProvider, UploadResult } from "./IStorageProvider";
import { buildCdnUrl } from "../../config/storage.config";

export class LocalStorageProvider implements IStorageProvider {
  public name = "Local Disk Storage";
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.resolve(process.cwd(), "public", "uploads");
  }

  async upload(
    key: string,
    buffer: Buffer,
    contentType: string = "image/webp"
  ): Promise<UploadResult> {
    const cleanKey = key.replace(/^\/+/, "");
    const fullPath = path.join(this.baseDir, cleanKey);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    const cdnUrl = buildCdnUrl(cleanKey);

    return {
      key: cleanKey,
      url: `/uploads/${cleanKey}`,
      cdnUrl,
      sizeBytes: buffer.length,
      contentType
    };
  }

  async delete(key: string): Promise<boolean> {
    const cleanKey = key.replace(/^\/+/, "");
    const fullPath = path.join(this.baseDir, cleanKey);
    try {
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    return buildCdnUrl(key);
  }

  async download(key: string): Promise<Buffer> {
    const cleanKey = key.replace(/^\/+/, "");
    const fullPath = path.join(this.baseDir, cleanKey);
    return await fs.readFile(fullPath);
  }
}
