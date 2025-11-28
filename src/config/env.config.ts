import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const envConfig = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    DATABASE_URL: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string()
  },
  clientPrefix: 'NEXT_PUBLIC_',
  client: {
    NEXT_PUBLIC_URL: z.string()
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true
});
