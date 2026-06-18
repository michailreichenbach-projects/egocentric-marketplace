import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const RAW_BUCKET = process.env.AWS_S3_BUCKET_RAW!;

// Generate a pre-signed URL so the companion app can upload directly to S3
// without routing large video files through our API server
export async function getUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: RAW_BUCKET,
    Key: key,
    ContentType: contentType,
    ServerSideEncryption: "AES256",
  });
  // URL expires in 1 hour — enough for a chunked upload
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
