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
  
  // For Electron builds, we can enable static export
  ...(process.env.NODE_ENV === 'production' && process.env.ELECTRON_BUILD ? {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  } : {}),
  
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/relianceautoworks.com/index.html',
      },
    ];
  }
};

export default nextConfig;
