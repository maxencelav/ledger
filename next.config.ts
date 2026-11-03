import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Security headers applied to every response.
 *
 * Next.js sends none of these on its own. The framing directives matter most
 * here: /consent is an OAuth authorization screen, so without them an attacker
 * could embed it invisibly and trick a signed-in user into clicking "Allow".
 */
const securityHeaders = [
  // Only `frame-ancestors` is set. A full CSP needs per-request nonces for
  // Next's inline scripts, which is a separate change; this directive is
  // independent of the rest and cannot break rendering.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Same protection for browsers that predate frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Denies features the app never uses. WebAuthn is listed explicitly as
  // self-allowed so passkeys keep working and the intent stays readable.
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
      "publickey-credentials-get=(self)",
      "publickey-credentials-create=(self)",
    ].join(", "),
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Don't advertise the framework and its version.
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isProduction
          ? [
              ...securityHeaders,
              // Sent only in production: over plain HTTP it is ignored, and
              // pinning localhost to HTTPS would be a nuisance in dev.
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains; preload",
              },
            ]
          : securityHeaders,
      },
    ];
  },
};

export default nextConfig;
