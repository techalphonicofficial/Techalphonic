import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/basics";
import type { Layout } from "@/lib/types";
import { lines } from "@/lib/utils";

const COLUMNS: [string, string][] = [
  ["footer_company", "Company"],
  ["footer_services", "Marketing"],
  ["footer_development", "Development"],
  ["footer_seo", "SEO"],
  ["footer_industries", "Industries"],
  ["footer_resources", "Resources"],
];

/** Port of components/footer.blade.php */
export function Footer({ layout }: { layout: Layout }) {
  const s = layout.settings;
  const columns = COLUMNS.map(([loc, label]) => ({ label, items: layout.menus[loc] ?? [] })).filter((c) => c.items.length);
  const legal = layout.menus.legal ?? [];
  const wa = s.whatsapp_url;
  const hours = lines(s.business_hours);

  return (
    <footer className="section-dark noise text-white/60" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mesh">
        <span className="-left-60 -top-40 size-[36rem] bg-teal/15" />
        <span className="-right-60 bottom-0 size-[36rem] bg-amber/10 [animation-delay:-10s]" />
      </div>

      <div className="container-x relative pt-20">
        {/* Contact strip */}
        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-2 lg:grid-cols-4">
          {s.phone && (
            <a href={s.phone_href ?? undefined} className="group flex items-center gap-3.5 rounded-2xl p-4 transition hover:bg-white/[0.06]">
              <span className="icon-tile icon-grad size-11 rounded-xl">
                <Icon name="phone" className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-white/50">Call us</span>
                <span className="block font-semibold text-white">{s.phone}</span>
              </span>
            </a>
          )}
          {s.email && (
            <a href={`mailto:${s.email}`} className="group flex items-center gap-3.5 rounded-2xl p-4 transition hover:bg-white/[0.06]">
              <span className="icon-tile size-11 rounded-xl bg-teal text-white">
                <Icon name="mail" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-white/50">Email us</span>
                <span className="block truncate font-semibold text-white">{s.email}</span>
              </span>
            </a>
          )}
          {wa && (
            <a href={wa} target="_blank" rel="noopener" className="group flex items-center gap-3.5 rounded-2xl p-4 transition hover:bg-white/[0.06]">
              <span className="icon-tile size-11 rounded-xl bg-[#25D366] text-white">
                <Icon name="whatsapp" className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-white/50">WhatsApp</span>
                <span className="block font-semibold text-white">Chat with us</span>
              </span>
            </a>
          )}
          {hours.length > 0 && (
            <div className="flex items-center gap-3.5 rounded-2xl p-4">
              <span className="icon-tile size-11 rounded-xl bg-amber/15 text-amber">
                <Icon name="clock" className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-white/50">Working hours</span>
                <span className="block font-semibold text-white">{hours[0]}</span>
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-14 py-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo settings={s} dark />
            {s.footer_about && <p className="mt-6 max-w-sm text-[0.93rem] leading-relaxed">{s.footer_about}</p>}
            {s.full_address && (
              <address className="mt-6 flex max-w-sm gap-3 text-[0.93rem] not-italic leading-relaxed">
                <Icon name="map-pin" className="mt-1 size-4 shrink-0 text-teal-200" />
                {s.full_address}
              </address>
            )}
            {layout.socials.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-2" role="list">
                {layout.socials.map((so) => (
                  <li key={so.url}>
                    <a
                      href={so.url}
                      target="_blank"
                      rel="noopener me"
                      className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:-translate-y-0.5 hover:border-transparent hover:bg-white hover:text-night"
                      aria-label={so.platform.charAt(0).toUpperCase() + so.platform.slice(1)}
                    >
                      <Icon name={so.icon} className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:col-span-8">
            {columns.map((col) => (
              <nav key={col.label} aria-label={col.label}>
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white">{col.label}</p>
                <ul className="mt-5 grid gap-3 text-[0.9rem]" role="list">
                  {col.items.slice(0, 8).map((item, i) =>
                    item.url ? (
                      <li key={i}>
                        <Link href={item.url} className="transition hover:text-white" {...(item.new_tab ? { target: "_blank", rel: "noopener" } : {})}>
                          {item.label}
                        </Link>
                      </li>
                    ) : null,
                  )}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* Oversized faded wordmark */}
      <div className="container-x pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <p className="whitespace-nowrap bg-gradient-to-b from-white/[0.14] to-white/0 bg-clip-text pb-2 text-center font-display font-bold leading-[0.9] tracking-[-0.06em] text-transparent" style={{ fontSize: "clamp(2.75rem, 11vw, 9.5rem)" }}>
          {s.site_name}
        </p>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-7 text-[0.82rem] text-white/45 sm:flex-row">
          <p>{s.copyright}</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2" role="list">
            {legal.map((item, i) => (
              <li key={i}>
                <Link href={item.url ?? "#"} className="transition hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/sitemap.xml" className="transition hover:text-white">
                Sitemap
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
