import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // recon-backend's R2_PUBLIC_URL — organization logos are uploaded
      // directly to R2 and served from this public bucket URL.
      {
        protocol: 'https',
        hostname: 'pub-a8fe00c3615b48f0bb02fe65cb57a047.r2.dev',
      },
      // Google OAuth profile pictures (session.user.image for Google sign-in).
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
