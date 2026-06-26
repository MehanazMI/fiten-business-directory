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
    const isDev = process.env.NODE_ENV === "development";
    const csp = [
      "default-src 'self'",
      // unsafe-eval needed by React in dev mode for call-stack reconstruction; omitted in prod
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://apis.google.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data: https:",
      "frame-src https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/ https://fiten-business-directory.firebaseapp.com https://accounts.google.com",
      "connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://cdn.jsdelivr.net https://accounts.google.com https://oauth2.googleapis.com https://www.google.com/recaptcha/",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
