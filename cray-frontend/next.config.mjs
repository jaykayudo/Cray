/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config, { isServer }) {
    // Exclude specific packages from being bundled on the client
    config.externals = config.externals || [];

    if (!isServer) {
      config.externals.push('@noir-lang/noirc_abi', '@noir-lang/acvm_js');
    }

    return config;
  },
}

export default nextConfig