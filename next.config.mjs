/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hardened defaults for production-grade deployments
  poweredByHeader: false,
  swcMinify: true,
  compress: true,
  experimental: {
    // Ensure logging dependencies stay external so their worker threads resolve correctly
    serverComponentsExternalPackages: ['pino', 'pino-pretty', 'thread-stream']
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.s3.amazonaws.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com', pathname: '/**' }
    ],
    formats: ['image/avif', 'image/webp']
  },
  async redirects() {
    return [
      { source: '/portfolio', destination: '/rituelen', permanent: true },
      { source: '/ventures/:path*', destination: '/rituelen/:path*', permanent: true },
      { source: '/admin/ventures/:path*', destination: '/admin/rituelen/:path*', permanent: true }
    ];
  }
};

export default nextConfig;
