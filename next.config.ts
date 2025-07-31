
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is required to allow the Next.js dev server to be accessed from the
  // Firebase Studio environment.
  experimental: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1753197031097.cluster-nzwlpk54dvagsxetkvxzbvslyi.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
