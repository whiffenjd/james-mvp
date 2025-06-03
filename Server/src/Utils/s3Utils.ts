import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function deleteS3Folder(userId: string) {
  try {
    // List all objects in the user's folder
    const listParams = {
      Bucket: process.env.BUCKET_NAME!,
      Prefix: `onboarding/${userId}/`,
    };

    const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams));

    if (!listedObjects.Contents?.length) return;

    // Create delete params
    const deleteParams = {
      Bucket: process.env.BUCKET_NAME!,
      Delete: {
        Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
      },
    };

    // Delete all objects in the folder
    await s3Client.send(new DeleteObjectsCommand(deleteParams));
  } catch (error) {
    console.error('Error deleting S3 folder:', error);
    throw error;
  }
}
