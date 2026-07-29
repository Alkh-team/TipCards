import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 is S3-compatible (region must be "auto")
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID     ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

/**
 * Upload a Buffer to R2 and return the public URL.
 * Returns null (and logs a warning) when R2 env vars are not configured,
 * so the app can still function locally without storage credentials.
 */
export async function uploadToR2(
  key:         string,
  body:        Buffer,
  contentType: string
): Promise<string | null> {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    console.warn("[r2] Storage not configured — skipping upload for key:", key);
    return null;
  }

  await r2.send(
    new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME ?? "tipcards",
      Key:         key,
      Body:        body,
      ContentType: contentType,
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
