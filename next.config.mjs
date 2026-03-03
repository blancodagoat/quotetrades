/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Keep @react-pdf/renderer as a server-only external so Next.js doesn't
    // try to bundle its Node.js internals for the client or edge runtime.
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};

export default nextConfig;
