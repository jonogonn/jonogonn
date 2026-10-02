import dotenv from "dotenv";

dotenv.config();

export interface StorageConfig {
  provider: "b2" | "s3" | "r2" | "local";
  endpoint?: string;
  region: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  bucketName: string;
  backupBucketName: string;
  cdnBaseUrl: string;
}

export const storageConfig: StorageConfig = {
  provider: (process.env.STORAGE_PROVIDER as any) || "b2",
  endpoint: process.env.STORAGE_ENDPOINT || "https://s3.us-west-004.backblazeb2.com",
  region: process.env.STORAGE_REGION || "us-west-004",
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY || ""
  },
  bucketName: process.env.STORAGE_BUCKET_NAME || "janogon-news-images",
  backupBucketName: process.env.STORAGE_BACKUP_BUCKET_NAME || "janogon-admin-backups",
  cdnBaseUrl: (process.env.CDN_BASE_URL || "").replace(/\/+$/, "")
};

/**
 * Resolves a stored relative key to a full CDN / public URL.
 * Even if Backblaze B2 is replaced with S3, R2, or local storage,
 * or CDN domain changes, this guarantees images always resolve properly.
 *
 * @param relativeKey e.g. "uploads/news/2026/10/example.webp" or already full URL
 */
export function buildCdnUrl(relativeKey: string | null | undefined): string {
  if (!relativeKey) return "";
  
  // If it's already an absolute URL (e.g. external link)
  if (relativeKey.startsWith("http://") || relativeKey.startsWith("https://")) {
    return relativeKey;
  }

  const cleanKey = relativeKey.replace(/^\/+/, "");

  if (storageConfig.cdnBaseUrl) {
    return `${storageConfig.cdnBaseUrl}/${cleanKey}`;
  }

  // Fallback to S3/B2 direct endpoint if CDN is not defined
  if (storageConfig.endpoint && storageConfig.bucketName) {
    return `${storageConfig.endpoint}/${storageConfig.bucketName}/${cleanKey}`;
  }

  return `/${cleanKey}`;
}
