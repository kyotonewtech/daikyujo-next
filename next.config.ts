import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    SESSION_SECRET: process.env.SESSION_SECRET,
  },
  turbopack: {
    root: '/mnt/c/temp/claude_hands/project/daikyujyo-next',
  },
};

export default nextConfig;
