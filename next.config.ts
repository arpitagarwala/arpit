import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/admin/:path*', destination: '/owner/:path*', permanent: true }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'substackcdn.com' },
      { protocol: 'https', hostname: 'substack-post-media.s3.amazonaws.com' },
    ],
  },
};

export default nextConfig;
