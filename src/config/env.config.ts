import { z } from 'zod';

// Server-only environment variables schema
const serverEnvSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  ARCJET_KEY: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_ENDPOINT_URL_S3: z.url(),
  AWS_ENDPOINT_URL_IAM: z.url(),
  AWS_REGION: z.string().min(1),
  // Client-safe vars cũng cần ở server
  NEXT_PUBLIC_URL: z.url(),
  NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES: z.string().min(1)
});

const validatedServerEnv = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  ARCJET_KEY: process.env.ARCJET_KEY,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_ENDPOINT_URL_S3: process.env.AWS_ENDPOINT_URL_S3,
  AWS_ENDPOINT_URL_IAM: process.env.AWS_ENDPOINT_URL_IAM,
  AWS_REGION: process.env.AWS_REGION,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES
});

if (!validatedServerEnv.success) {
  console.error('Server env validation errors:', validatedServerEnv.error.issues);
  throw new Error('Các giá trị khai báo trong file .env không hợp lệ');
}

export const envConfig = validatedServerEnv.data;
