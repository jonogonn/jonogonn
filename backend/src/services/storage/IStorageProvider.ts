export interface UploadResult {
  key: string;
  url: string;
  cdnUrl: string;
  sizeBytes: number;
  contentType: string;
}

export interface IStorageProvider {
  name: string;
  upload(
    key: string,
    buffer: Buffer,
    contentType: string,
    bucketOverride?: string
  ): Promise<UploadResult>;

  delete(key: string, bucketOverride?: string): Promise<boolean>;

  getUrl(key: string): string;

  download(key: string, bucketOverride?: string): Promise<Buffer>;
}
