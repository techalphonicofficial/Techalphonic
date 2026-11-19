# Tech Alphonic — Next.js frontend

The public website, built with **Next.js 16** (App Router, Cache Components, React 19, Tailwind CSS v4).
Laravel in [`../backend`](../backend) is the backend: admin panel, database, media, leads, SEO logic and the site API.
It no longer renders public pages. Public URLs that reach it directly are 301'd to `FRONTEND_URL`.
The UI started as a port of the old Blade frontend and is now the only public UI.

```
Browser ──► Next.js (this app, public domain)
              ├─ pages: rendered from GET /api/v1/site/resolve?path=…   (cached, revalidated on admin save)
              └─ proxied to Laravel: /admin  /api  /storage  /build  /sitemap*.xml  /robots.txt
Laravel ──► POST {FRONTEND_URL}/next-api/revalidate after every content/settings/redirect save
```

## How it fits together

| Concern | Where |
|---|---|
| Page data | `backend/app/Http/Controllers/Api/V1/SiteController.php` — one resolver turns any path into `{kind, seo, data}` (SeoService, SchemaService, FaqService, InternalLinkService…) |
| Serialisers | `backend/app/Support/SitePresenter.php`, `backend/app/Services/BlockPresenter.php` (page-builder blocks with media and DB lookups pre-resolved) |
| Routes | `src/app/page.tsx` (home), `src/app/[...path]/page.tsx` (everything else), `src/app/search`, `src/app/preview/[type]/[token]` |
| Templates | `src/components/home` (homepage sections), `src/components/pages` (CMS, service, landing, blog, portfolio, case studies), `src/components/blocks` (27 block types) |
| Behaviour | `src/components/runtime` — enquiry popup, video lightbox, scroll reveals, spotlight cards, magnetic buttons, `dataLayer` tracking, auto-popup, UTM capture |
| Redirects | `src/proxy.ts` — admin 301/302/410 redirects (map from Laravel, cached 60 s), trailing-slash canonicalisation, blog `?page=N` |
| Styles | `src/app/globals.css` — the public design system (the admin panel has its own `backend/resources/css/admin.css`) |
| Icons | `src/lib/icons.generated.ts` — generated from `App\Support\Icons` (shared with the admin panel) |
| Admin hooks | `src/app/next-api/revalidate` (purge cache after admin saves) and `src/app/next-api/status` (build URLs + backend reachability for Admin → Maintenance); both require `REVALIDATE_SECRET` |
| Lead form | `src/components/forms/LeadForm.tsx` → `POST /api/v1/leads` (validation, spam checks, emails stay in Laravel) |

**Rendering.** Every page is static. Indexable URLs (the sitemap list) are prerendered at build time. Any other URL renders once on its first request and is then cached. A missing page returns a real `404`. Search and previews render per request.

**Freshness.** Saving anything in the admin (content, menus, settings, redirects) makes Laravel call `/next-api/revalidate`. The next visitor then gets a fresh render. The `site` cache profile also revalidates hourly as a safety net.

## Local development

Run Laravel and this app side by side:

```bash
# backend/ (Laravel)
php artisan serve                 # http://127.0.0.1:8000

# frontend/
cp .env.example .env.local        # then fill in the values below
npm install
npm run dev                       # http://localhost:3000
```

| Variable (`frontend/.env.local`) | Value |
|---|---|
| `BACKEND_URL` | Where the Next server reaches Laravel, e.g. `http://127.0.0.1:8000` |
| `BACKEND_PUBLIC_ORIGINS` | Origins Laravel writes into absolute URLs (`APP_URL` and the `BACKEND_URL` host), comma separated. They are rewritten to `SITE_URL`. |
| `SITE_URL` | Public origin of this site, e.g. `http://localhost:3000` |
| `FRONTEND_API_KEY` | Same value as `FRONTEND_API_KEY` in Laravel's `.env` (exempts the Next server from the site API rate limit) |
| `REVALIDATE_SECRET` | Same value as `FRONTEND_REVALIDATE_SECRET` in Laravel's `.env` |
| `ADMIN_PATH` | Same as Laravel's `ADMIN_PATH` |
| `PRERENDER_LIMIT` | Optional. Maximum number of pages prerendered at build (default 500) |

Laravel's `.env` needs `FRONTEND_URL` (this site's URL), `FRONTEND_API_KEY` and `FRONTEND_REVALIDATE_SECRET`.

## Production

1. Deploy Laravel (`backend/`, see the root README), reachable from the Next server, ideally on an internal address.
   Set `APP_URL` to the **public** domain, because media URLs, canonicals and sitemaps are built from it.
2. Set `FRONTEND_URL` in Laravel's `.env`. Public URLs that reach Laravel directly are 301'd there, so the backend
   host never serves duplicate pages. Admin, the API, sitemaps and robots.txt are served normally.
3. Build and run this app (Laravel must be reachable during the build, because pages are prerendered from the API):
   ```bash
   npm ci && npm run build
   npm run start -- -p 3000      # behind Nginx / a process manager such as PM2 or systemd
   ```
4. Point the public domain at the Next server. `/admin`, `/api`, `/storage`, `/build`, sitemaps and robots are proxied to Laravel by the rewrites in `next.config.ts`.
   If Nginx sits in front, disable buffering for streamed responses (`proxy_buffering off;` or the `X-Accel-Buffering: no` header).

## Extending the site

- **Icons:** after adding icons to `App\Support\Icons`, run `php artisan site:export-icons` in `backend/`.
- **New block type:** register it in `PageBlock::TYPES` (admin), resolve any DB lookups in `BlockPresenter::extra()`, then add a renderer to `BODIES` in `src/components/blocks/Blocks.tsx`.
- **New homepage section:** add it to `HomeSection::KEYS` and to `SECTIONS` in `src/components/home/HomeSections.tsx`. Media IDs in section content are resolved automatically.

```bash
npm run lint
npx tsc --noEmit
```
