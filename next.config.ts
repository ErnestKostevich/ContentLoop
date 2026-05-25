import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // We run `tsc --noEmit` separately. The built-in TS check spawns a
  // worker that doesn't inherit NODE_OPTIONS and OOMs on Windows / small
  // machines — keeping it off here means our pipeline owns type-checking.
  typescript: {
    ignoreBuildErrors: true,
  },

  // Build with fewer workers — Next 16 defaults to (CPU count) workers
  // which on a 14-thread Windows box tries to allocate ~50GB of virtual
  // address space at peak and crashes. Two workers is plenty for a
  // single-developer project.
  experimental: {
    cpus: 2,
  },
};

export default nextConfig;
