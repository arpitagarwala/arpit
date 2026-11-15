import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {key: 'Content-Type', value: 'application/javascript; charset=utf-8'},
          {key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate'},
          {key: 'Content-Security-Policy', value: "default-src 'self'"},
        ],
      },
      {
        source: '/downloads/Arpit-Agarwala.exe',
        headers: [
          {key: 'Content-Disposition', value: 'attachment; filename="Arpit-Agarwala.exe"'},
          {key: 'Content-Type', value: 'application/octet-stream'},
          {key: 'X-Content-Type-Options', value: 'nosniff'},
        ],
      },
      {
        source: '/downloads/Arpit-Agarwala.apk',
        headers: [
          {key: 'Content-Disposition', value: 'attachment; filename="Arpit-Agarwala.apk"'},
          {key: 'Content-Type', value: 'application/vnd.android.package-archive'},
          {key: 'X-Content-Type-Options', value: 'nosniff'},
        ],
      },
    ];
  },
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
