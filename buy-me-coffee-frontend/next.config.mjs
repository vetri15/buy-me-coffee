/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  basePath: "/buy-me-coffee",
  images: {
    unoptimized: true,
  }
};

export default nextConfig;
