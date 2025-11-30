import path from 'node:path';

/** @type {import("next").NextConfig} */
const nextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        hostname: 'res.cloudinary.com',
        pathname: '/**'
      },
      {
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      }
    ]
  },
  turbopack: {
    // dùng cwd thay cho __dirname trong ESM
    root: path.join(process.cwd())
  }
};

export default nextConfig;
