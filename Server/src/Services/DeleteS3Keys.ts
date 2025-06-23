import { DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Extract key from full S3 URL
export function extractKeyFromUrl(url: string): string {
  const urlObj = new URL(url);
  return decodeURIComponent(urlObj.pathname.slice(1)); // remove leading "/"
}

async function deleteS3Keys(keys: string[]) {
  if (!keys.length) return;

  const deleteParams = {
    Bucket: process.env.BUCKET_NAME!,
    Delete: {
      Objects: keys.map((Key) => ({ Key })),
    },
  };

  await s3.send(new DeleteObjectsCommand(deleteParams));
}
export default deleteS3Keys;
