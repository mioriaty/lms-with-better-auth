// prisma.config.ts
// 1. Phải import 'dotenv/config' để tải biến môi trường (nếu bạn dùng .env)
import 'dotenv/config';
// 2. Phải import env để sử dụng trong datasource
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // SỬ DỤNG HÀM env() thay vì process.env.
    url: env('DATABASE_URL')
  },
  migrations: {
    path: 'prisma/migrations'
  }
});
