import type {NextConfig} from 'next';
import path from 'path';

//Parte Jafeth punto 3 resuelto
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/Ilusion_Integrales' : '',
  assetPrefix: isProd ? '/Ilusion_Integrales/' : '',
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
