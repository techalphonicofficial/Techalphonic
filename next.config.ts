import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

const lanHosts = Object.values(networkInterfaces())
  .flat()
  .filter((n): n is NonNullable<typeof n> => Boolean(n && n.family === "IPv4" && !n.internal))
  .map((n) => n.address);

/**
 * Next.js serves the public website; Laravel (../backend) is the backend + admin panel.
 * Everything Laravel still owns on the public domain is proxied through these rewrites,
 * so the site runs on one domain: /admin, /api, /storage (media), /build (admin assets), sitemaps, robots.
 */
if (!process.env.BACKEND_URL?.trim()) {
  throw new Error(
    "BACKEND_URL is not set. Production: put it in frontend/.env.production on the machine that runs `next build`; local: frontend/.env.local (see .env.example).",
  );
}
const BACKEND = process.env.BACKEND_URL.trim().replace(/\/$/, "");
// Same default as Laravel's config/site.php; set both when the admin is moved to a non-obvious path.
const ADMIN_PATH = process.env.ADMIN_PATH?.trim() || "admin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.*", ...lanHosts],
  experimental: {
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Canonical URLs end with "/" (same as Laravel). The proxy adds the slash itself so backend paths are untouched.
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // CMS content: refreshed on demand by Laravel (revalidateTag "site"); the hourly revalidate is only a safety net.
  cacheLife: {
    site: { stale: 300, revalidate: 3600, expire: 60 * 60 * 24 * 30 },
  },
  turbopack: {
    // ../backend has its own package-lock.json; keep Turbopack scoped to this app.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const toBackend = (source: string) => ({ source, destination: `${BACKEND}${source}` });
    return {
      beforeFiles: [
        toBackend("/api/:path*"),
        toBackend("/storage/:path*"),
        toBackend("/build/:path*"),
        toBackend(`/${ADMIN_PATH}`),
        toBackend(`/${ADMIN_PATH}/:path*`),
        toBackend("/sitemap.xml"),
        toBackend("/sitemap-:section.xml"),
        toBackend("/robots.txt"),
        toBackend("/up"),
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
