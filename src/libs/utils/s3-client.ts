import 'server-only';

import { envConfig } from '@/config';
import { S3Client } from '@aws-sdk/client-s3';

export const S3 = new S3Client({
  region: envConfig.AWS_REGION,
  endpoint: envConfig.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: false
});
