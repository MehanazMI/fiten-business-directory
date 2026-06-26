import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Legacy static-site URLs (pre-cutover index.html/form.html deployment).
    // Keep these so old bookmarks and shared links survive the fiten.org cutover.
    return [
      { source: "/index.html", destination: "/directory", permanent: true },
      { source: "/form.html", destination: "/form", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent browsers from MIME-sniffing the response content type
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Block clickjacking — only allow framing from same origin
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop sending referrer to cross-origin destinations
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict powerful browser features we don't use
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Force HTTPS for 1 year (includeSubDomains for good measure)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // CSP: allow scripts from self + Google (reCAPTCHA), styles from self + fonts, fonts from Google
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/",
              "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
