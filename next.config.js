/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_VISION_API_KEY: process.env.GOOGLE_VISION_API_KEY,
  },
  images: {
    domains: ["localhost"], // Add any other domains you need
  },
};

module.exports = nextConfig;
