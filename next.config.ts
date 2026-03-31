import type {NextConfig} from 'next';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/Ilusion_Integrales' : '',
  assetPrefix: isProd ? '/Ilusion_Integrales/' : '',
  images: {
    unoptimized: true,
  },
  // Evita que Next infiera la raíz del monorepo por un package-lock en un directorio padre.
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
