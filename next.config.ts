import type { NextConfig } from "next";

// Static security headers applied to every response. The Content-Security-Policy
// is intentionally NOT here — it carries a per-request nonce and is set in
// proxy.ts instead. These are the headers that need no per-request value.
const securityHeaders = [
  // Force HTTPS for two years, including subdomains. Vercel serves HTTPS only.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Don't let browsers MIME-sniff a response into a different content type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy clickjacking guard for browsers predating CSP frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  // Send only the origin on cross-origin navigations; full URL stays same-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Drop access to powerful APIs this app never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
