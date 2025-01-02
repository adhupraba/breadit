/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["static.crunchyroll.com", "uploadthing.com"],
  },
  // rewrites are for local development to send cookies to cross origin requests (to backend server)
  rewrites: async () => {
    return [{ source: "/api/gateway/:path*", destination: `${process.env.API_URL}/gateway/:path*` }];
  },
};

module.exports = nextConfig;
