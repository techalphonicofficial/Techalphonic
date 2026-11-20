import Link from "next/link";
import { LeadForm } from "@/components/forms/LeadForm";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { BrandSquares, Html, QUOTE_PATH, Stars } from "@/components/ui/basics";
import { BlogCard, ServiceCard } from "@/components/ui/cards";
import { CountUp, TabButton, TabGroup, TabPanel } from "@/components/ui/interactive";
import { EnquirySection, FaqSection } from "@/components/ui/sections";
import { getLayout } from "@/lib/api";
import type { CaseStudyCard, HomeData, HomeSection, Item, Media, Testimonial } from "@/lib/types";
import { cn, highlight, limit, splitWords, stripHighlight } from "@/lib/utils";

/*
 * Homepage sections (port of resources/views/frontend/home/*). Order and visibility come from
 * Admin → Homepage, exactly like the Blade build.
 */

type P = { section: HomeSection; data: HomeData };

const media = (data: HomeData, id: unknown): Media | null => (id ? data.media[String(id)] ?? null : null);

export function HomeSections({ data }: { data: HomeData }) {
  return (
    <>
      {data.sections.map((section) => {
        const Section = SECTIONS[section.key];
        return Section ? <Section key={section.key} section={section} data={data} /> : null;
      })}
    </>
  );
}

const SECTIONS: Record<string, (p: P) => React.ReactNode> = {
  hero: Hero,
  clients: Clients,
  services: Services,
  promo: Promo,
  about: About,
  showreel: Showreel,
  process: Process,
  industries: Industries,
  technologies: Technologies,
  portfolio: Portfolio,
  testimonials: Testimonials,
  blogs: Blogs,
  faq: ({ section, data }) => <FaqSection faqs={data.faqs} title={stripHighlight(section.title || "Frequently asked questions")} eyebrow={section.eyebrow || "FAQ"} subtitle={section.subtitle} />,
  enquiry: ({ section }) => <EnquirySection heading={section.title} text={section.subtitle} eyebrow={section.eyebrow || "Let’s talk"} formName="home-enquiry" />,
  cta: FinalCta,
  stats: Stats,
};

function Hero({ section, data }: P) {
  const hero = data.hero;
  if (!hero) return null;
  const stats = ((section.content.stats ?? []) as Item[]).slice(0, 4);
  const ticker = ((section.content.ticker ?? []) as string[]).filter(Boolean);
  const poster = hero.background;
  const video = hero.background_video;
  const toPopup = !hero.cta_url || hero.cta_url.endsWith("#enquiry-popup") || hero.cta_url === "#enquire";

  return (
    <>
      <section className="relative isolate overflow-hidden bg-white text-ink" aria-labelledby="hero-title">
        {/* Background: optional poster/video washed out to white, a drifting colour mesh and a fine grid */}
        <div className="absolute inset-0 -z-10">
          {poster && <Img media={poster} priority sizes="100vw" className="absolute inset-0 size-full object-cover" alt="" />}
          {video && (
            <video className="absolute inset-0 size-full object-cover motion-reduce:hidden" autoPlay muted loop playsInline preload="metadata" poster={poster ? poster.webp || poster.url : undefined} aria-hidden="true">
              <source src={video.url} type={video.mime ?? undefined} />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/[0.93] to-white/60 max-lg:via-white/95 max-lg:to-white/90" />
          <div className="mesh">
            <span className="-left-32 -top-24 size-[34rem] bg-teal/25" />
            <span className="right-[-8rem] top-1/3 size-[30rem] bg-amber/25 [animation-delay:-6s]" />
            <span className="bottom-[-12rem] left-1/3 size-[28rem] bg-brand/15 [animation-delay:-12s]" />
          </div>
          <div className="bg-grid-light absolute inset-0 opacity-70" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="container-x grid items-center gap-8 py-5 sm:py-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,25rem)] lg:gap-10 lg:py-7">
          <div className="max-w-[44rem]">
            {hero.badge && (
              <span className="badge-pill border-ink/10 bg-white/80 py-1 pl-1 pr-3.5 text-ink-700 shadow-[var(--shadow-xs)] backdrop-blur" data-aos="fade-down">
                <span className="grid size-6 place-items-center rounded-full bg-night text-amber">
                  <Icon name="sparkles" className="size-3.5" />
                </span>
                {hero.badge}
              </span>
            )}

            <h1 id="hero-title" className="h-display mt-3.5 text-ink" data-split="">
              {splitWords(hero.heading)}
            </h1>

            {hero.description && (
              <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600 sm:text-[1.05rem]" data-aos="fade-up" data-aos-delay="250">
                {hero.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3" data-aos="fade-up" data-aos-delay="350">
              {hero.cta_text && (
                <a href={toPopup ? "#enquiry-popup" : hero.cta_url!} {...(toPopup ? { "data-enquiry": "hero" } : {})} className="btn btn-primary btn-lg group pr-2" data-cta="hero-primary" data-magnetic="">
                  {hero.cta_text}
                  <span className="ml-1 grid size-8 place-items-center rounded-full bg-white/20 transition group-hover:translate-x-0.5">
                    <Icon name="arrow-right" className="size-4" />
                  </span>
                </a>
              )}
              {hero.showreel_url ? (
                <button type="button" data-video={hero.showreel_url} className="group inline-flex items-center gap-3.5 text-left">
                  <span className="relative grid size-14 place-items-center rounded-full bg-white text-brand shadow-[var(--shadow-lift)] ring-1 ring-ink/5 transition group-hover:scale-105">
                    <span className="absolute inset-0 animate-ping rounded-full bg-teal/25 motion-reduce:hidden" />
                    <Icon name="play" className="relative ml-0.5 size-5 fill-current" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-ink">{hero.secondary_cta_text || "Watch video"}</span>
                    <span className="block text-xs text-ink-500">1 min overview</span>
                  </span>
                </button>
              ) : hero.secondary_cta_text ? (
                <Link href={hero.secondary_cta_url || data.links.portfolio} className="btn btn-secondary btn-lg">
                  {hero.secondary_cta_text}
                </Link>
              ) : null}
            </div>

            {hero.trust_text && (
              <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-line bg-white/70 py-1.5 pl-3 pr-4 backdrop-blur" data-aos="fade-up" data-aos-delay="450">
                <span className="flex gap-0.5 text-amber" aria-hidden="true">
                  <Stars rating={5} />
                </span>
                <span className="h-4 w-px bg-line" aria-hidden="true" />
                <p className="text-sm font-medium text-ink-600">{hero.trust_text}</p>
              </div>
            )}
          </div>

          {/* Compact enquiry card */}
          {hero.show_form ? (
            <div id="hero-enquiry" className="relative w-full lg:justify-self-end" data-aos="fade-left" data-aos-delay="200">
              <div className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-teal/45 via-amber/25 to-brand/35 opacity-60 blur-2xl" />
              <div className="ring-gradient relative overflow-hidden rounded-[1.75rem] bg-white/95 text-ink shadow-[0_40px_80px_-30px_rgb(6_20_24/0.45)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-3.5">
                  <span className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    Free consultation
                  </span>
                  <span className="rounded-full bg-mist px-2.5 py-1 text-[0.7rem] font-semibold text-ink-600">Reply within 24h</span>
                </div>
                <div className="p-6 sm:p-7">
                  <p className="font-display text-[1.5rem] font-bold leading-tight" style={{ letterSpacing: "-0.035em" }}>
                    Get your free growth plan
                  </p>
                  <p className="mt-1.5 text-sm text-ink-500">Tell us what you need — a specialist will call you back.</p>
                  <LeadForm mini bare title="" formName="home-hero" button="Get free consultation" className="mt-5" />
                </div>
              </div>
            </div>
          ) : hero.image ? (
            <div className="relative" data-aos="zoom-in" data-aos-delay="150">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-teal/35 via-transparent to-amber/30 blur-3xl" />
              <Img media={hero.image} priority sizes="(min-width:1024px) 400px, 100vw" className="relative w-full rounded-[2rem] border border-white shadow-2xl" />
            </div>
          ) : null}
        </div>

        {stats.length > 0 && (
          <div className="container-x pb-6 lg:pb-7" data-aos="fade-up" data-aos-delay="300">
            <dl className="grid grid-cols-2 gap-y-5 border-t border-ink/10 pt-5 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div key={i} className={cn("px-4 sm:px-6", i % 2 ? "border-l border-ink/10" : "pl-0 sm:pl-0", i > 0 && i % 2 === 0 && "lg:border-l lg:border-ink/10 lg:pl-6")}>
                  <dd className="font-display text-[2.4rem] font-bold leading-none tracking-[-0.05em] text-ink sm:text-5xl">
                    <CountUp value={s.value} />
                    <span className="text-brand">{s.suffix ?? ""}</span>
                  </dd>
                  <dt className="mt-1.5 text-[0.82rem] font-medium leading-snug text-ink-500">{s.label ?? ""}</dt>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {ticker.length > 0 && (
        /* Moving services ribbon: dark band, alternating solid and faded words */
        <div className="relative overflow-hidden bg-night py-3.5 text-white sm:py-4" aria-hidden="true">
          <div className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap motion-reduce:animate-none sm:gap-12">
            {[0, 1].map((pass) =>
              ticker.map((t, i) => (
                <span key={`${pass}-${i}`} className="flex items-center gap-8 font-display text-2xl font-bold tracking-[-0.03em] sm:gap-12 sm:text-[2.1rem]">
                  <span className={i % 2 === 0 ? "" : "text-outline"}>{t}</span>
                  <span className="brand-squares rotate-45 scale-75">
                    <span className="bg-teal" />
                    <span className="bg-amber" />
                    <span className="bg-amber" />
                    <span className="bg-teal" />
                  </span>
                </span>
              )),
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Clients({ section, data }: P) {
  const logos = (section.content.items ?? []) as { name?: string; logo_id?: number }[];
  if (!logos.length) return null;
  return (
    <section className="border-b border-line bg-white py-4 sm:py-5" aria-label={section.title || "Clients"}>
      <div className="container-x">
        {section.title && (
          <p className="flex items-center justify-center gap-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-ink-500">
            <span className="h-px w-10 bg-line" />
            {section.title}
            <span className="h-px w-10 bg-line" />
          </p>
        )}
        <div className="fade-x relative mt-3 overflow-hidden">
          <ul className="flex w-max animate-marquee items-center gap-14 hover:[animation-play-state:paused] motion-reduce:animate-none" role="list">
            {[0, 1].map((pass) =>
              logos.map((logo, i) => {
                const m = media(data, logo.logo_id);
                return (
                  <li key={`${pass}-${i}`} aria-hidden={pass ? true : undefined} className="shrink-0">
                    {m ? (
                      <Img media={m} alt={logo.name ?? ""} className="h-9 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" sizes="160px" />
                    ) : (
                      <span className="font-display text-2xl font-bold tracking-[-0.04em] text-ink/35 transition hover:text-ink">{logo.name}</span>
                    )}
                  </li>
                );
              }),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Services({ section, data }: P) {
  const cats = data.categories;
  if (!cats.length) return null;
  const image = media(data, section.content.image_id);
  return (
    <section className="section relative" aria-labelledby="services-heading">
      <TabGroup initial="0">
        <div className="container-x">
          <div className="mb-6 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-2xl" data-reveal="">
              {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
              <h2 id="services-heading" className="h-section mt-2">
                {highlight(section.title)}
              </h2>
              {section.subtitle && <p className="mt-2.5 max-w-xl text-[1.02rem] leading-relaxed text-ink-500">{section.subtitle}</p>}
            </div>
            {cats.length > 1 && (
              <div className="inline-flex max-w-full shrink-0 overflow-x-auto rounded-full border border-line bg-mist p-1.5" role="tablist" aria-label="Service categories" data-reveal="">
                {cats.map((cat, i) => (
                  <TabButton key={cat.slug} id={String(i)} className="flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition" activeClass="bg-night text-white shadow-md" inactiveClass="text-ink-500 hover:text-ink">
                    <Icon name={cat.icon || "layers"} className="size-4" /> {cat.menu_label || cat.name}
                  </TabButton>
                ))}
              </div>
            )}
          </div>

          {cats.map((cat, i) => (
            <TabPanel key={cat.slug} id={String(i)}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Feature tile (bento anchor) */}
                <Link href={cat.url} className="group relative isolate flex min-h-[20rem] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-night p-6 text-white sm:col-span-2 lg:row-span-2 lg:p-8" data-aos="zoom-in">
                  {image && <Img media={image} sizes="(min-width:1024px) 600px, 100vw" className="absolute inset-0 -z-10 size-full object-cover opacity-55 transition duration-[1.2s] group-hover:scale-105 group-hover:opacity-65" alt="" />}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/10" />
                  <div className="mesh opacity-80">
                    <span className="-right-24 -top-24 size-80 bg-teal/40" />
                    <span className="-bottom-24 left-10 size-72 bg-amber/20 [animation-delay:-8s]" />
                  </div>
                  <span className="absolute right-8 top-8 grid size-12 place-items-center rounded-full border border-white/20 bg-white/10 backdrop-blur transition duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-night lg:right-10 lg:top-10">
                    <Icon name="arrow-up-right" className="size-5" />
                  </span>
                  <div>
                    <span className="badge-pill border-white/20 bg-white/10 text-white backdrop-blur">
                      <Icon name={cat.icon || "layers"} className="size-3.5" /> {cat.services_count} services
                    </span>
                    <h3 className="mt-5 font-display text-[2.1rem] font-bold leading-[1.05] text-white sm:text-[2.5rem]" style={{ letterSpacing: "-0.045em" }}>
                      {cat.heading}
                    </h3>
                    {cat.short_description && <p className="mt-4 max-w-md text-[0.98rem] leading-relaxed text-white/75">{cat.short_description}</p>}
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">
                      Explore {cat.name}
                      <span className="h-px w-8 bg-white/60 transition-all duration-500 group-hover:w-14 group-hover:bg-amber" />
                    </span>
                  </div>
                </Link>

                {/* 8 cards = 4 beside the 2×2 feature tile + one full row below */}
                {cat.services.map((service, j) => (
                  <ServiceCard key={service.url} service={service} index={j} />
                ))}
              </div>

              <div className="relative mt-5 flex flex-col items-start justify-between gap-4 overflow-hidden rounded-[var(--radius-card)] bg-night px-5 py-4 text-white sm:flex-row sm:items-center sm:px-6">
                <div className="bg-dots-dark pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                <div className="relative flex items-center gap-4">
                  <span className="icon-tile icon-grad">
                    <Icon name="message" className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold tracking-[-0.02em] text-white">Not sure which service you need?</p>
                    <p className="text-sm text-white/60">Tell us your goal — we’ll recommend the right mix, free.</p>
                  </div>
                </div>
                <div className="relative flex flex-wrap gap-3">
                  <button type="button" data-enquiry="services-help" className="btn btn-light group">
                    Get expert advice <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
                  </button>
                  <Link href={cat.url} className="btn btn-ghost-dark" data-cta={`home-all-${cat.slug}`}>
                    All {cat.name} services
                  </Link>
                </div>
              </div>
            </TabPanel>
          ))}
        </div>
      </TabGroup>
    </section>
  );
}

function Promo({ section, data }: P) {
  const c = section.content;
  const image = media(data, c.image_id);
  const points = (c.points ?? []) as string[];
  return (
    <section className="pb-7 pt-1 sm:pb-8 sm:pt-2" aria-labelledby="promo-heading">
      <div className="container-x">
        <div className="section-dark noise rounded-[2rem] shadow-[0_40px_80px_-40px_rgb(6_20_24/0.7)]" data-reveal="">
          <div className="mesh">
            <span className="-right-24 -top-32 size-[26rem] bg-teal/35" />
            <span className="-bottom-40 left-1/4 size-[24rem] bg-amber/20 [animation-delay:-9s]" />
          </div>
          <div className="bg-grid absolute inset-0 -z-10" />

          <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:p-10">
            <div>
              {section.eyebrow && (
                <span className="badge-pill border-amber/30 bg-amber/10 text-amber">
                  <Icon name="sparkles" className="size-3.5" /> {section.eyebrow}
                </span>
              )}
              <h2 id="promo-heading" className="mt-4 font-display font-bold leading-[1.04]" style={{ fontSize: "clamp(2rem, 1.2rem + 2.4vw, 3.3rem)", letterSpacing: "-0.045em" }}>
                {highlight(section.title)}
              </h2>
              {section.subtitle && <p className="mt-3 max-w-xl text-[1.02rem] leading-relaxed text-white/65">{section.subtitle}</p>}
              {points.length > 0 && (
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2" role="list">
                  {points.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[0.95rem] font-medium text-white/85" data-aos="fade-up" data-aos-delay={String(i * 70)}>
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-teal/20 text-teal-200 ring-1 ring-teal/40">
                        <Icon name="check" className="size-3" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button type="button" data-enquiry="promo-banner" className="btn btn-light btn-lg group" data-magnetic="">
                  {c.button_text || "Claim my free audit"} <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
                </button>
                {c.note && <span className="text-sm font-medium text-white/50">{c.note}</span>}
              </div>
            </div>

            <div className="relative hidden lg:block" data-aos="fade-left" data-aos-delay="150">
              {image && (
                <div className="relative ml-auto aspect-[4/3.3] max-w-md rotate-2 overflow-hidden rounded-[1.5rem] shadow-2xl ring-1 ring-white/15 transition duration-500 hover:rotate-0">
                  <Img media={image} sizes="450px" className="size-full object-cover" />
                </div>
              )}
              {(c.price_new || c.price_old) && (
                <div className="absolute -bottom-6 left-0 rounded-2xl border border-white/15 bg-night-800/80 p-4 shadow-xl backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">{c.price_label || "Offer value"}</p>
                  <p className="font-display text-2xl font-bold">
                    {c.price_old && <span className="text-white/40 line-through decoration-coral decoration-2">{c.price_old}</span>} <span className="text-amber">{c.price_new || "FREE"}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About({ section, data }: P) {
  const c = section.content;
  const image = media(data, c.image_id);
  const points = (c.points ?? []) as string[];
  return (
    <section className="section relative overflow-hidden bg-cloud" aria-labelledby="about-heading">
      <div className="bg-dots pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-60 [mask-image:linear-gradient(to_right,black,transparent)]" />
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="relative order-2 lg:order-1" data-reveal="">
          {image ? (
            <div className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
              <Img media={image} sizes="(min-width:1024px) 560px, 100vw" className="parallax aspect-[5/4] w-full object-cover" />
            </div>
          ) : (
            /* Composition used until a team/office photo is uploaded */
            <div className="relative grid grid-cols-6 gap-4" aria-hidden="true">
              <div className="section-dark noise col-span-4 rounded-[1.75rem] p-8 shadow-[var(--shadow-lift)]">
                <div className="mesh">
                  <span className="-right-16 -top-16 size-64 bg-teal/40" />
                  <span className="-bottom-20 -left-10 size-56 bg-amber/20 [animation-delay:-7s]" />
                </div>
                <BrandSquares className="relative" />
                <p className="relative mt-12 text-sm text-white/55">Strategy · Design · Engineering · Growth</p>
                <p className="relative mt-2 font-display text-[1.65rem] font-bold leading-[1.15] tracking-[-0.035em] text-white">One accountable team for your entire digital growth.</p>
              </div>
              <div className="col-span-2 flex flex-col justify-end gap-4">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-teal to-brand p-5 text-white shadow-[var(--shadow-glow)] motion-safe:animate-float">
                  <Icon name="trending-up" className="size-7" />
                  <p className="mt-6 text-sm font-semibold">Growth focused</p>
                </div>
                <div className="rounded-[1.5rem] bg-amber p-5 text-ink motion-safe:animate-float [animation-delay:-4s]">
                  <Icon name="code" className="size-7" />
                  <p className="mt-6 text-sm font-semibold">Built in-house</p>
                </div>
              </div>
              <div className="col-span-6 grid grid-cols-3 gap-4">
                {[
                  ["search", "SEO"],
                  ["target", "Ads"],
                  ["smartphone", "Apps"],
                ].map(([ic, l]) => (
                  <div key={l} className="spotlight flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-card)]">
                    <span className="icon-tile size-10 rounded-xl bg-mist text-ink-700">
                      <Icon name={ic} className="size-[18px]" />
                    </span>
                    <span className="text-sm font-semibold text-ink">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {c.badge_value && (
            <div className="absolute -top-6 right-6 rounded-2xl border border-white/80 bg-white/85 px-5 py-4 shadow-[var(--shadow-lift)] backdrop-blur-xl sm:right-10">
              <p className="font-display text-4xl font-bold tracking-[-0.05em] text-ink">
                <CountUp value={c.badge_value} />
                <span className="text-gradient">{c.badge_suffix}</span>
              </p>
              <p className="text-xs font-medium text-ink-500">{c.badge_label}</p>
            </div>
          )}
        </div>
        <div className="order-1 lg:order-2" data-reveal="">
          {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
          <h2 id="about-heading" className="h-section mt-2.5">
            {highlight(section.title)}
          </h2>
          {section.subtitle && <p className="mt-3 text-lg font-medium leading-relaxed text-ink-700">{section.subtitle}</p>}
          <Html html={c.text} className="prose-content mt-3 !text-ink-500" />
          {points.length > 0 && (
            <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2" role="list">
              {points.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand">
                    <Icon name="check" className="size-3.5" />
                  </span>
                  <span className="text-[0.95rem] font-medium text-ink">{p}</span>
                </li>
              ))}
            </ul>
          )}
          {c.cta_text && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={c.cta_url || data.links.about} className="btn btn-dark btn-lg group" data-cta="home-about">
                {c.cta_text} <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Showreel({ section, data }: P) {
  const c = section.content;
  const image = media(data, c.image_id);
  const videoUrl = c.video_url || media(data, c.video_id)?.url || data.hero?.showreel_url;
  const stats = (c.stats ?? []) as Item[];
  if (!image && !videoUrl) return null;
  return (
    <section className="section relative overflow-hidden bg-white" aria-labelledby="showreel-heading">
      <div className="container-x relative">
        <div className="mb-7 grid items-end gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div data-reveal="" data-aos="fade-right">
            {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
            <h2 id="showreel-heading" className="h-section mt-4">
              {highlight(section.title)}
            </h2>
          </div>
          {section.subtitle && (
            <p className="max-w-md text-[1.05rem] leading-relaxed text-ink-500 lg:justify-self-end" data-reveal="" data-aos="fade-left">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] bg-night shadow-[0_40px_80px_-40px_rgb(6_20_24/0.6)]" data-reveal="" data-aos="zoom-in">
          <div className="aspect-[16/9] overflow-hidden sm:aspect-[21/9]">{image && <Img media={image} sizes="(min-width:1280px) 1200px, 100vw" className="parallax size-full object-cover" />}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/15 to-transparent" />

          {videoUrl && (
            <button type="button" data-video={videoUrl} className="absolute inset-0 grid place-items-center" aria-label="Play video">
              <span className="relative grid size-24 place-items-center rounded-full bg-white/30 backdrop-blur-md transition duration-300 group-hover:scale-110 sm:size-28">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/30 motion-reduce:hidden" />
                <span className="grid size-16 place-items-center rounded-full bg-white text-brand shadow-xl sm:size-20">
                  <Icon name="play" className="ml-1 size-7 fill-current" />
                </span>
              </span>
            </button>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-end sm:p-10">
            <p className="max-w-md font-display text-xl font-bold leading-tight tracking-[-0.03em] text-white sm:text-[1.85rem]">Strategy, design and engineering — under one roof.</p>
            {stats.length > 0 && (
              <dl className="flex gap-3">
                {stats.map((s, i) => (
                  <div key={i} className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-xl">
                    <dd className="font-display text-2xl font-bold tracking-[-0.04em] text-white">
                      {s.value}
                      <span className="text-amber">{s.suffix}</span>
                    </dd>
                    <dt className="text-xs text-white/60">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Process({ section }: P) {
  const steps = (section.content.steps ?? []) as Item[];
  if (!steps.length) return null;
  const cols = ({ 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3" } as Record<number, string>)[steps.length] ?? "lg:grid-cols-4";
  return (
    <section className="section section-dark noise" aria-labelledby="process-heading">
      <div className="mesh">
        <span className="-left-40 top-0 size-[34rem] bg-teal/25" />
        <span className="-right-32 bottom-0 size-[28rem] bg-amber/15 [animation-delay:-9s]" />
      </div>
      <div className="bg-grid absolute inset-0 -z-10" />

      <div className="container-x">
        <div className="mb-6 grid items-end gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div data-reveal="">
            {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
            <h2 id="process-heading" className="h-section mt-2">
              {highlight(section.title)}
            </h2>
          </div>
          {section.subtitle && (
            <p className="max-w-md text-[1.02rem] leading-relaxed text-white/60 lg:justify-self-end" data-reveal="">
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="relative">
          {/* Timeline track; fills left→right as the section scrolls into view (where supported) */}
          <div className="absolute inset-x-0 top-6 hidden h-px overflow-hidden bg-white/10 lg:block" aria-hidden="true">
            <div className="scroll-fill h-full w-full bg-gradient-to-r from-teal via-teal-200 to-amber" />
          </div>

          <ol className={cn("grid gap-5 md:grid-cols-2 lg:gap-6", cols)} role="list">
            {steps.map((step, i) => (
              <li key={i} className="relative" data-reveal="stagger">
                <div className="flex items-center gap-4">
                  <span className="relative z-10 grid size-12 place-items-center rounded-full bg-night-800 text-teal-200 ring-1 ring-white/15">
                    <Icon name={step.icon ?? "sparkles"} className="size-5" />
                  </span>
                  <span className="relative z-10 rounded-full border border-white/10 bg-night-800 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/60">Step {String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="card-dark spotlight mt-4 overflow-hidden">
                  <span className="text-outline pointer-events-none absolute -right-2 -top-4 font-display text-[6.5rem] font-bold leading-none" style={{ "--stroke": "rgb(255 255 255 / 0.05)" } as React.CSSProperties} aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="relative text-[1.2rem] font-bold tracking-[-0.03em]">{step.title}</h3>
                  <p className="relative mt-2 text-[0.93rem] leading-relaxed text-white/60">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4" data-reveal="">
          <button type="button" data-enquiry="process" className="btn btn-light btn-lg group">
            Start with a free consultation <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
          </button>
          <span className="text-sm text-white/50">No obligation · Reply within one business day</span>
        </div>
      </div>
    </section>
  );
}

function Industries({ section, data }: P) {
  if (!data.industries.length) return null;
  return (
    <section className="section relative overflow-hidden bg-white" aria-labelledby="industries-heading">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_100%,black,transparent)]" />
      <div className="container-x relative">
        <div className="mb-6 grid items-end gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div data-reveal="" data-aos="fade-right">
            {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
            <h2 id="industries-heading" className="h-section mt-2">
              {highlight(section.title)}
            </h2>
          </div>
          {section.subtitle && (
            <p className="max-w-md text-[1.02rem] leading-relaxed text-ink-500 lg:justify-self-end lg:text-right" data-reveal="" data-aos="fade-left">
              {section.subtitle}
            </p>
          )}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="list">
          {data.industries.map((industry) => (
            <li key={industry.id} data-reveal="stagger" data-aos="zoom-in">
              <Link href={industry.url || data.links.industries} className="spotlight group flex h-full flex-col justify-between gap-6 rounded-2xl border border-line bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-lift)]">
                <span className="flex items-start justify-between">
                  <span className="grid size-10 place-items-center rounded-xl bg-mist text-ink-700 transition group-hover:bg-night group-hover:text-teal-200">
                    <Icon name={industry.icon || "building"} className="size-5" />
                  </span>
                  <Icon name="arrow-up-right" className="size-4 text-ink/20 transition duration-300 group-hover:rotate-45 group-hover:text-brand" />
                </span>
                <span className="font-display text-[1.02rem] font-semibold leading-snug tracking-[-0.02em] text-ink">{industry.name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-7 text-center" data-aos="fade-up">
          <Link href={data.links.industries} className="btn btn-secondary btn-lg group" data-cta="home-industries">
            See all industries <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Technologies({ section }: P) {
  const items = (section.content.items ?? []) as { name?: string; group?: string }[];
  const groups = new Map<string, typeof items>();
  items.forEach((t) => groups.set(t.group ?? "Other", [...(groups.get(t.group ?? "Other") ?? []), t]));
  if (!groups.size) return null;
  return (
    <section className="py-3 sm:py-4" aria-labelledby="tech-heading">
      <TabGroup initial="0">
        <div className="container-x">
          <div className="grid gap-8 rounded-[2rem] border border-line bg-cloud p-6 sm:p-8 lg:grid-cols-[0.9fr_1.4fr] lg:p-10">
            <div data-reveal="">
              {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
              <h2 id="tech-heading" className="h-section mt-2">
                {highlight(section.title)}
              </h2>
              {section.subtitle && <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-500">{section.subtitle}</p>}
              <div className="mt-5 flex flex-wrap gap-2" role="tablist">
                {[...groups.keys()].map((name, i) => (
                  <TabButton key={name} id={String(i)} className="rounded-full border px-4 py-2 text-sm font-semibold transition" activeClass="border-night bg-night text-white" inactiveClass="border-line bg-white text-ink-600 hover:border-ink/30">
                    {name}
                  </TabButton>
                ))}
              </div>
            </div>
            <div className="self-center">
              {[...groups.values()].map((techs, i) => (
                <TabPanel key={i} id={String(i)}>
                  <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="list">
                    {techs.map((t, j) => (
                      <li key={j} className="spotlight flex items-center gap-3 rounded-2xl border border-line bg-white px-3.5 py-3 shadow-[var(--shadow-xs)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg text-sm font-extrabold text-white", ["bg-brand", "bg-teal", "bg-amber", "bg-steel"][j % 4])}>{(t.name ?? "?").charAt(0)}</span>
                        <span className="truncate text-[0.93rem] font-semibold text-ink">{t.name}</span>
                      </li>
                    ))}
                  </ul>
                </TabPanel>
              ))}
            </div>
          </div>
        </div>
      </TabGroup>
    </section>
  );
}

function Portfolio({ section, data }: P) {
  const studies = data.case_studies;
  const portfolio = data.portfolio;
  if (!studies.length && !portfolio.length) return null;
  return (
    <section className="section" aria-labelledby="work-heading">
      <div className="container-x">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl" data-reveal="">
            {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
            <h2 id="work-heading" className="h-section mt-4">
              {highlight(section.title)}
            </h2>
            {section.subtitle && <p className="lead mt-4">{section.subtitle}</p>}
          </div>
          <Link href={data.links.portfolio} className="btn btn-secondary" data-cta="home-portfolio">
            View portfolio <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>

        {studies.length > 0 && <CaseStudyCards studies={studies} />}

        {portfolio.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.slice(0, studies.length ? 3 : 6).map((item) => {
              const cat = (item.category ?? "").toLowerCase();
              return (
                <Link key={item.url} href={item.url} className="group relative block overflow-hidden rounded-[var(--radius-card)] bg-night ring-1 ring-ink/5" data-reveal="stagger" data-aos="zoom-in">
                  <div className="aspect-[4/3]">
                    {item.featured_image ? (
                      <Img media={item.featured_image} sizes="(min-width:1024px) 400px, 50vw" className="size-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      /* Branded placeholder until project images are uploaded */
                      <div className="relative isolate size-full overflow-hidden bg-night">
                        <div className="bg-grid absolute inset-0" />
                        <div className="mesh">
                          <span className="-right-12 -top-12 size-64 bg-teal/35 transition duration-700 group-hover:scale-125" />
                          <span className="-bottom-16 -left-10 size-56 bg-amber/20" />
                        </div>
                        <div className="absolute left-6 top-6 grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-teal-200 backdrop-blur">
                          <Icon name={cat.includes("app") ? "smartphone" : cat.includes("seo") ? "trending-up" : "layout"} className="size-6" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-night/90 via-night/50 to-transparent p-6 pt-20">
                    <div className="transition duration-500 group-hover:-translate-y-1">
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-amber">{item.category}</p>
                      <p className="mt-1 font-display text-xl font-bold leading-snug tracking-[-0.03em] text-white">{item.title}</p>
                    </div>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-night">
                      <Icon name="arrow-up-right" className="size-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/** Home "Our work" case studies: 1 = wide feature card, 2 = halves, 3+ = tall lead + stack. */
export function CaseStudyCards({ studies }: { studies: CaseStudyCard[] }) {
  const count = studies.length;
  const solo = count === 1;
  return (
    <div className={cn("grid gap-6", count === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3")}>
      {studies.map((study, i) => (
        <article
          key={study.url}
          className={cn(
            "spotlight group flex flex-col overflow-hidden rounded-[var(--radius-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
            i === 0 && "section-dark",
            i === 0 && count > 2 && "lg:row-span-2",
            solo && "lg:col-span-3 lg:flex-row",
            i !== 0 && "border border-line bg-white",
          )}
          data-reveal="stagger"
        >
          {study.featured_image && (
            <div className={cn("m-2 aspect-[16/10] shrink-0 overflow-hidden rounded-[1rem]", solo && "lg:aspect-auto lg:min-h-[24rem] lg:w-1/2")}>
              <Img media={study.featured_image} sizes={`(min-width:1024px) ${solo ? "600px" : "400px"}, 100vw`} className="size-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
          )}
          <div className={cn("flex flex-1 flex-col p-5 sm:p-6", solo && "lg:justify-center lg:p-10")}>
            <p className={cn("text-xs font-bold uppercase tracking-[0.16em]", i === 0 ? "text-teal-200" : "text-brand")}>{study.industry?.name ?? "Case study"}</p>
            <h3 className={cn("mt-2.5 font-bold leading-snug tracking-[-0.03em]", solo ? "text-[1.6rem] lg:text-[2.1rem] lg:leading-[1.1]" : "text-[1.3rem]")}>
              <Link href={study.url} className="after:absolute after:inset-0">
                {study.title}
              </Link>
            </h3>
            {study.summary && <p className={cn("mt-2.5", i === 0 ? "text-white/60" : "text-ink-500")}>{limit(study.summary, 160)}</p>}
            {study.metrics.length > 0 && (
              <dl className={cn("grid grid-cols-2 gap-4 border-t pt-4", solo ? "mt-6" : "mt-auto", i === 0 ? "border-white/10" : "border-line")}>
                {study.metrics.slice(0, 2).map((m, j) => (
                  <div key={j}>
                    <dd className={cn("font-display text-[2.4rem] font-bold leading-none tracking-[-0.05em]", i !== 0 && "text-ink")}>{m.value}</dd>
                    <dt className={cn("mt-1.5 text-xs", i === 0 ? "text-white/50" : "text-steel")}>{m.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function Testimonials({ section, data }: P) {
  const all = data.testimonials;
  if (!all.length) return null;
  // Marquee wall when there are enough reviews; two rows (opposite directions) from 6+.
  const rows = all.length >= 6 ? [all.slice(0, Math.ceil(all.length / 2)), all.slice(Math.ceil(all.length / 2))] : [all];
  return (
    <section className="section section-dark noise" aria-labelledby="testimonials-heading">
      <div className="mesh">
        <span className="left-1/4 -top-40 size-[36rem] bg-teal/20" />
        <span className="-right-24 bottom-0 size-[26rem] bg-amber/15 [animation-delay:-10s]" />
      </div>

      <div className="container-x">
        <div className="mb-6 grid items-end gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div data-reveal="">
            {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
            <h2 id="testimonials-heading" className="h-section mt-2">
              {highlight(section.title)}
            </h2>
          </div>
          <div className="lg:justify-self-end" data-reveal="">
            {section.subtitle && <p className="max-w-md text-[1.02rem] leading-relaxed text-white/60">{section.subtitle}</p>}
            <button type="button" data-enquiry="testimonials" className="btn btn-light group mt-4">
              Become our next success story <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {all.length >= 3 ? (
        <div className="fade-x grid gap-5 overflow-hidden motion-reduce:overflow-x-auto" data-reveal="">
          {rows.map((row, r) => (
            <ul key={r} className={cn("flex w-max hover:[animation-play-state:paused] motion-reduce:animate-none", r ? "animate-marquee-reverse" : "animate-marquee")} role="list" style={{ animationDuration: `${Math.max(35, row.length * 11)}s` }}>
              {[0, 1].map((pass) =>
                row.map((t, i) => (
                  <li key={`${pass}-${i}`} className="w-[min(84vw,24rem)] shrink-0 pr-5" aria-hidden={pass ? true : undefined}>
                    <DarkTestimonial t={t} />
                  </li>
                )),
              )}
            </ul>
          ))}
        </div>
      ) : (
        <div className="container-x">
          <ul className="grid gap-5 md:grid-cols-2" role="list">
            {all.map((t, i) => (
              <li key={i} data-reveal="stagger">
                <DarkTestimonial t={t} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function DarkTestimonial({ t }: { t: Testimonial }) {
  return (
    <figure className="card-dark spotlight flex h-full flex-col">
      <div className="flex items-center justify-between">
        <span className="flex gap-0.5 text-amber" aria-label={`${t.rating} out of 5`}>
          <Stars rating={t.rating} />
        </span>
        <svg className="size-8 text-white/10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d={QUOTE_PATH} />
        </svg>
      </div>
      <blockquote className="mt-3.5 flex-1 text-[0.95rem] leading-relaxed text-white/85">“{limit(t.review, 260)}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3.5 border-t border-white/10 pt-4">
        {t.photo ? (
          <Img media={t.photo} className="size-11 rounded-full object-cover ring-2 ring-white/10" sizes="44px" />
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-teal to-brand text-sm font-bold text-white">{t.initials}</span>
        )}
        <span className="min-w-0">
          <span className="block truncate font-semibold text-white">{t.name}</span>
          <span className="block truncate text-xs text-white/50">{[t.designation, t.company].filter(Boolean).join(" · ")}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Blogs({ section, data }: P) {
  if (!data.blogs.length) return null;
  return (
    <section className="section" aria-labelledby="blogs-heading">
      <div className="container-x">
        <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl" data-reveal="">
            {section.eyebrow && <p className="eyebrow">{section.eyebrow}</p>}
            <h2 id="blogs-heading" className="h-section mt-4">
              {highlight(section.title)}
            </h2>
            {section.subtitle && <p className="lead mt-4">{section.subtitle}</p>}
          </div>
          <Link href={data.links.blog} className="btn btn-secondary" data-cta="home-blog">
            All articles <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.blogs.map((post) => (
            <BlogCard key={post.url} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats({ section }: P) {
  const items = (section.content.items ?? []) as Item[];
  if (!items.length) return null;
  return (
    <section className="section-sm section-dark noise" aria-label={section.title || "Our numbers"}>
      <div className="mesh">
        <span className="-left-32 -top-32 size-[28rem] bg-teal/25" />
        <span className="-right-20 -bottom-32 size-[24rem] bg-amber/15 [animation-delay:-9s]" />
      </div>
      <div className="container-x">
        <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {items.map((s, i) => (
            <div key={i} className={cn("px-4 sm:px-8", i % 2 && "border-l border-white/10", i > 0 && i % 2 === 0 && "lg:border-l lg:border-white/10")} data-reveal="stagger">
              <dd className="h-mega text-[clamp(2.75rem,1.6rem+3.6vw,5rem)]">
                <CountUp value={s.value} />
                <span className="text-teal-200">{s.suffix}</span>
              </dd>
              <dt className="mt-3 text-sm font-medium text-white/55">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

async function FinalCta({ section, data }: P) {
  const { settings } = await getLayout();
  const bg = media(data, section.content.image_id) ?? media(data, data.promo_image_id);
  return (
    <section className="py-5 pb-8" aria-labelledby="final-cta-heading">
      <div className="container-x">
        <div className="section-dark noise rounded-[2rem] shadow-[0_40px_90px_-40px_rgb(6_20_24/0.75)]" data-reveal="" data-aos="zoom-in-up">
          {bg && <Img media={bg} sizes="(min-width:1280px) 1200px, 100vw" className="absolute inset-0 -z-10 size-full object-cover opacity-[0.07] grayscale [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_80%)]" alt="" />}
          <div className="mesh">
            <span className="-left-24 -top-32 size-[30rem] bg-teal/35" />
            <span className="-bottom-40 right-1/4 size-[28rem] bg-amber/20 [animation-delay:-8s]" />
            <span className="-right-24 top-0 size-[20rem] bg-brand/40 [animation-delay:-14s]" />
          </div>
          <div className="bg-grid absolute inset-0 -z-10" />

          <div className="relative px-6 py-8 text-center sm:px-10 lg:py-11">
            {section.eyebrow && <p className="eyebrow justify-center">{section.eyebrow}</p>}
            <h2 id="final-cta-heading" className="mx-auto mt-3 max-w-4xl font-display font-bold leading-[1.02]" style={{ fontSize: "clamp(2.3rem, 1.2rem + 3.6vw, 4.5rem)", letterSpacing: "-0.05em" }}>
              {highlight(section.title)}
            </h2>
            {section.subtitle && <p className="mx-auto mt-3.5 max-w-xl text-lg leading-relaxed text-white/65">{section.subtitle}</p>}
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row" data-aos="fade-up" data-aos-delay="150">
              <button type="button" data-enquiry="final-cta" className="btn btn-light btn-lg group w-full sm:w-auto" data-magnetic="">
                {section.content.button_text || "Get my free consultation"} <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
              </button>
              {settings.phone && (
                <a href={settings.phone_href ?? undefined} className="btn btn-ghost-dark btn-lg w-full sm:w-auto">
                  <Icon name="phone" className="size-4 text-teal-200" /> Call {settings.phone}
                </a>
              )}
            </div>
            <p className="mt-4 text-sm text-white/45">Free consultation · Reply within one business day</p>
          </div>
        </div>
      </div>
    </section>
  );
}

