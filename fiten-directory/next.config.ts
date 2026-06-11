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
};

export default nextConfig;
