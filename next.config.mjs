/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  // As per Next.js documentation for allowing cross-origin dev requests
  // but let's just stick to the most stable config
};

export default nextConfig;
