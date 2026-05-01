import type { NextConfig } from "next";

const isCapacitor = process.env.BUILD_TARGET === 'capacitor';

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Force HTTPS
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Control referrer info sent to other sites
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Permissions — only allow mic/camera from same origin
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(self), geolocation=()' },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
      // Firebase / Google APIs
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com wss://generativelanguage.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://accounts.google.com https://apis.google.com https://*.google.com https://api.openai.com",
      // Scripts — Next.js needs 'unsafe-inline' + 'unsafe-eval' in dev
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com",
      // Styles
      "style-src 'self' 'unsafe-inline'",
      // Images — allow data URIs and Firebase storage
      "img-src 'self' data: blob: https://*.googleapis.com https://*.googleusercontent.com https://firebasestorage.googleapis.com",
      // Fonts
      "font-src 'self' data:",
      // Media — mic/camera
      "media-src 'self' blob:",
      // Workers (speech synthesis, etc.)
      "worker-src 'self' blob:",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google profile photos
    ],
  },

  // Static export for Capacitor/iOS builds
  ...(isCapacitor && {
    output: 'export',
    trailingSlash: true,
    images: { unoptimized: true },
  }),

  // Security headers for all routes
  ...(!isCapacitor && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ];
    },
  }),
};

export default nextConfig;
