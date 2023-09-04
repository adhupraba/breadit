/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["static.crunchyroll.com", "uploadthing.com"],
  },
};

module.exports = nextConfig;
