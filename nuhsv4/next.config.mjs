/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  reactStrictMode: false,
  assetPrefix: isProd
    ? "http://webpackbucket.s3-website-ap-southeast-1.amazonaws.com"
    : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.w3schools.com",
        port: "",
        pathname: "/howto/**",
      },
    ],
  },
};

export default nextConfig;
