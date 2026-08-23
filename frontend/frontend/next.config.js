/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://rsre-backend.onrender.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
