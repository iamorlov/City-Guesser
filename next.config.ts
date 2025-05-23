/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // The trailing slash is recommended for static sites
  trailingSlash: true,
};

module.exports = nextConfig;