export const constructUrl = (path: string): string => {
  if (!path) return '';
  const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES;
  return `https://${bucketName}.t3.storage.dev/${path}`;
};
