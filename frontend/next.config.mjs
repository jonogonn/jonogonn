/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
