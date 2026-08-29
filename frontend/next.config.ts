import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A stray lockfile in a parent directory makes Next infer the wrong workspace
  // root; pin it to this app.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
