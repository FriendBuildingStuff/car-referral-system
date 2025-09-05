import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
//  outputFileTracingRoot: path.join(__dirname, '../../'),

  eslint:{
    ignoreDuringBuilds: true,
  },
   typescript: {
    ignoreBuildErrors: true, // This will ignore TypeScript errors during the build process
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/relianceautoworks.com/index.html',
      },
    ];
  },

  output: 'standalone',
};

export default nextConfig;
