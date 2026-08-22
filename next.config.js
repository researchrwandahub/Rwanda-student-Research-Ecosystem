/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Keep archived upgrade packages outside the production Next.js source tree.
  pageExtensions: ["tsx", "ts", "jsx", "js"],
};

module.exports = nextConfig;