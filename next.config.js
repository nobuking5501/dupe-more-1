/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude admin-panel directory from Next.js build
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/admin-panel/**', '**/shared/**', '**/public-site/**']
    }
    return config
  }
}

module.exports = nextConfig