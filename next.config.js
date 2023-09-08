/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["static.crunchyroll.com", "uploadthing.com"],
  },
  rewrites: async () => {
    return [{ source: "/api/gateway/:path*", destination: `${process.env.API_URL}/:path*` }];
  },
};

module.exports = nextConfig;
