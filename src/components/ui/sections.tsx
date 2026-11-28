import Link from "next/link";
import type { ReactNode } from "react";
import { LeadForm } from "@/components/forms/LeadForm";
import { getLayout } from "@/lib/api";
import type { Crumb, Faq, LinkGroup, Media } from "@/lib/types";
import { cn, highlight, splitWords } from "@/lib/utils";
import { Icon } from "./Icon";
import { Img } from "./Img";
import { Breadcrumb, Html } from "./basics";
import { FaqList } from "./interactive";

/** <x-cta>: dark | brand | light band */
export async function Cta({
  heading,
  text,
  buttonText = "Get a Free Consultation",
  buttonUrl,
  variant = "dark",
}: {
  heading?: string | null;
  text?: string | null;
  buttonText?: string;
  buttonUrl?: string | null;
  variant?: "dark" | "brand" | "light";
}) {
  const { settings } = await getLayout();
  const dark = variant === "dark";
  const wa = settings.whatsapp_enabled ? settings.whatsapp_url : null;
  const resolvedHeading = heading || settings.footer_cta_heading || "Let’s build something that grows your business";
  const resolvedText = text || settings.footer_cta_text || "Talk to our specialists today — free consultation, honest advice and a clear plan.";
  const toPopup = Boolean(buttonUrl && (buttonUrl.endsWith("#enquiry-popup") || buttonUrl === "#enquire"));
  return (
    <section className="py-5 sm:py-6">
      <div className="container-x">
        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] px-6 py-7 sm:px-9 lg:px-11 lg:py-9",
            dark && "section-dark noise shadow-[0_40px_80px_-40px_rgb(6_20_24/0.7)]",
            variant === "brand" && "border border-teal/25 bg-gradient-to-br from-teal-50 via-white to-brand-50 text-ink shadow-[var(--shadow-card)]",
            variant === "light" && "border border-line bg-cloud text-ink",
          )}
          data-reveal=""
          data-aos="zoom-in-up"
        >
          {dark ? (
            <>
              <div className="mesh">
                <span className="-right-24 -top-32 size-[28rem] bg-teal/35" />
                <span className="-bottom-40 left-10 size-[26rem] bg-amber/20 [animation-delay:-8s]" />
              </div>
              <div className="bg-grid absolute inset-0 -z-10" />
            </>
          ) : variant === "brand" ? (
            <div className="absolute -right-20 -top-20 size-80 rounded-full bg-teal/20 blur-3xl" />
          ) : (
            <div className="bg-dots pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          )}
          <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className={cn("font-display font-bold leading-[1.05]", dark ? "text-white" : "text-ink")} style={{ fontSize: "clamp(1.9rem, 1.2rem + 2vw, 3rem)", letterSpacing: "-0.045em" }}>
                {highlight(resolvedHeading)}
              </h2>
              <p className={cn("mt-4 text-[1.075rem] leading-relaxed", dark ? "text-white/65" : "text-ink-500")}>{resolvedText}</p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              {toPopup ? (
                <a href="#enquiry-popup" data-enquiry="cta-band" className={cn("btn btn-lg group", dark ? "btn-light" : "btn-primary")} data-cta="cta-band" data-magnetic="">
                  {buttonText} <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
                </a>
              ) : (
                <Link href={buttonUrl || "/contact/"} className={cn("btn btn-lg group", dark ? "btn-light" : "btn-primary")} data-cta="cta-band" data-magnetic="">
                  {buttonText} <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
                </Link>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener" className={cn("btn btn-lg", dark ? "btn-ghost-dark" : "btn-secondary")}>
                  <Icon name="whatsapp" className="size-[18px]" /> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** <x-faq> — the same list feeds the FAQPage schema (Laravel FaqService). */
export async function FaqSection({ faqs, title = "Frequently asked questions", eyebrow = "FAQ", subtitle }: { faqs: Faq[]; title?: string; eyebrow?: string; subtitle?: string | null }) {
  if (!faqs.length) return null;
  const { settings } = await getLayout();
  return (
    <section className="section" aria-labelledby="faq-heading" id="faq">
      <div className="container-x grid gap-8 lg:grid-cols-[0.85fr_1.4fr] lg:gap-12">
        <div className="lg:sticky lg:top-32 lg:self-start" data-reveal="">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="faq-heading" className="h-section mt-2.5">
            {highlight(title)}
          </h2>
          <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-500">{subtitle ?? "Can’t find what you’re looking for? Our team is happy to help."}</p>
          <div className="mt-5 rounded-2xl border border-line bg-cloud p-4">
            <p className="font-semibold text-ink">Still have questions?</p>
            <p className="mt-1 text-sm text-ink-500">Speak directly with a specialist.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="#enquire" className="btn btn-primary" data-cta="faq-ask">
                Ask a question
              </a>
              {settings.phone && (
                <a href={settings.phone_href ?? undefined} className="btn btn-secondary">
                  <Icon name="phone" className="size-4" /> Call us
                </a>
              )}
            </div>
          </div>
        </div>
        <FaqList faqs={faqs} />
      </div>
    </section>
  );
}

/** <x-enquiry-section> */
export async function EnquirySection({
  heading,
  text,
  service,
  location,
  formName = "enquiry",
  eyebrow = "Let’s talk",
  buttonText,
}: {
  heading?: string | null;
  text?: string | null;
  service?: string | null;
  location?: string | null;
  formName?: string;
  eyebrow?: string;
  buttonText?: string | null;
}) {
  const { settings: s } = await getLayout();
  const wa = s.whatsapp_enabled ? s.whatsapp_url : null;
  return (
    <section id="enquire" className="relative isolate scroll-mt-24 overflow-hidden bg-cloud py-8 sm:py-10 lg:py-11">
      <div className="bg-grid-light pointer-events-none absolute inset-0 -z-10" />
      <div className="mesh">
        <span className="-left-40 -top-40 size-[34rem] bg-amber/15" />
        <span className="-bottom-40 right-0 size-[30rem] bg-teal/20 [animation-delay:-9s]" />
      </div>

      <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,34rem)] lg:gap-12">
        <div data-reveal="" data-aos="fade-right">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="h-section mt-3">{highlight(heading || "Tell us about your project")}</h2>
          <p className="mt-3.5 max-w-xl text-lg leading-relaxed text-ink-600">{text || "Get a free, no-obligation consultation. We’ll review your goals and come back with a clear plan, timeline and estimate."}</p>

          <ul className="mt-6 grid gap-3.5" role="list">
            {[
              ["Free strategy call with a specialist", "A 30-minute session focused on your goals."],
              ["Clear proposal within 48 hours", "Scope, timeline and transparent pricing."],
              ["No lock-in, no surprises", "Monthly reporting and honest advice."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-4">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-teal text-white">
                  <Icon name="check" className="size-4" />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{t}</span>
                  <span className="text-sm text-ink-500">{d}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {s.phone && (
              <a href={s.phone_href ?? undefined} className="spotlight group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-xs)] transition hover:border-transparent hover:shadow-[var(--shadow-card)]">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                  <Icon name="phone" className="size-[18px]" />
                </span>
                <span>
                  <span className="block text-xs text-ink-500">Call us</span>
                  <span className="block font-semibold text-ink">{s.phone}</span>
                </span>
              </a>
            )}
            {wa ? (
              <a href={wa} target="_blank" rel="noopener" className="spotlight group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-xs)] transition hover:border-transparent hover:shadow-[var(--shadow-card)]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#25D366]/15 text-[#25D366]">
                  <Icon name="whatsapp" className="size-[18px]" />
                </span>
                <span>
                  <span className="block text-xs text-ink-500">WhatsApp</span>
                  <span className="block font-semibold text-ink">Chat instantly</span>
                </span>
              </a>
            ) : s.email ? (
              <a href={`mailto:${s.email}`} className="group flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4 transition hover:border-teal/50">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand">
                  <Icon name="mail" className="size-[18px]" />
                </span>
                <span>
                  <span className="block text-xs text-ink-500">Email</span>
                  <span className="block font-semibold text-ink">{s.email}</span>
                </span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="lg:justify-self-end" data-reveal="" data-aos="fade-left">
          <LeadForm service={service} location={location} formName={formName} compact title="Request a free consultation" subtitle="Average response time: under 4 business hours." button={buttonText || "Get my free consultation"} />
        </div>
      </div>
    </section>
  );
}

/** <x-related-links> */
export function RelatedLinks({ groups }: { groups: LinkGroup[] }) {
  if (!groups?.length) return null;
  return (
    <section className="section-sm border-t border-line" aria-label="Related pages">
      <div className="container-x grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title} data-reveal="">
            <h2 className="font-display text-base font-bold uppercase tracking-[0.1em] text-ink">{g.title}</h2>
            <ul className="mt-4 grid gap-2" role="list">
              {g.links.map((link) => (
                <li key={link.url}>
                  <Link href={link.url} className="group flex items-center gap-2 text-[0.95rem] text-ink-600 hover:text-brand">
                    <Icon name="chevron-right" className="size-4 text-brand transition-transform group-hover:translate-x-0.5" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </section>
  );
}

/** <x-page-hero>: split | centered | minimal | image-bg | dark */
export async function PageHero({
  title,
  eyebrow,
  subtitle,
  intro,
  breadcrumbs = [],
  image,
  layout = "split",
  form = false,
  formService,
  formLocation,
  formTitle = "Request a free consultation",
  formSubtitle = "Average response time: under 4 business hours.",
  actions,
  aside,
  children,
}: {
  title: string;
  eyebrow?: string | null;
  subtitle?: string | null;
  intro?: string | null;
  breadcrumbs?: Crumb[];
  image?: Media | null;
  layout?: string | null;
  form?: boolean;
  formService?: string | null;
  formLocation?: string | null;
  formTitle?: string;
  formSubtitle?: string;
  /** Replaces the default buttons. Pass `false` for no buttons (Blade's empty actions slot). */
  actions?: ReactNode | false;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const { settings } = await getLayout();
  const lay = layout || "split";
  const dark = lay === "dark";
  const rich = ["split", "image-bg", "centered", "dark"].includes(lay);
  const twoCol = ["split", "image-bg", "dark"].includes(lay) && Boolean(image || form || aside);
  const hasActions = actions !== undefined;

  return (
    <section className={cn("relative isolate overflow-hidden", dark && "section-dark noise", rich && !dark && "bg-white", !rich && "bg-cloud")}>
      {lay === "image-bg" && image ? (
        <>
          <Img media={image} priority sizes="100vw" className="absolute inset-0 -z-10 size-full object-cover opacity-30" alt="" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/90 to-white/60" />
        </>
      ) : dark ? (
        <>
          <div className="mesh">
            <span className="-left-40 -top-48 size-[38rem] bg-teal/30" />
            <span className="-right-48 top-16 size-[32rem] bg-amber/15 [animation-delay:-9s]" />
          </div>
          <div className="bg-grid absolute inset-0 -z-10" />
        </>
      ) : rich ? (
        <>
          <div className="mesh">
            <span className="-left-40 -top-48 size-[36rem] bg-teal/20" />
            <span className="-right-48 top-16 size-[30rem] bg-amber/20 [animation-delay:-9s]" />
          </div>
          <div className="bg-grid-light absolute inset-0 -z-10" />
        </>
      ) : (
        <div className="bg-grid-light absolute inset-0 -z-10" />
      )}
      {!dark && <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white/80 to-transparent" />}

      <div className={cn("container-x relative", lay === "minimal" ? "py-5 sm:py-7" : "py-6 sm:py-8 lg:py-9")}>
        <Breadcrumb items={breadcrumbs} dark={dark} className="mb-4" />

        <div className={cn("grid items-center gap-8", twoCol && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,28rem)] lg:gap-10", lay === "centered" && "mx-auto max-w-3xl text-center")}>
          <div className={lay === "minimal" ? "max-w-3xl" : ""}>
            {eyebrow && (
              <p className={cn("eyebrow", dark && "eyebrow-dark", lay === "centered" && "justify-center")} data-aos="fade-down">
                {eyebrow}
              </p>
            )}
            <h1 className={cn("mt-3 font-display font-bold leading-[1.03]", dark && "text-white")} style={{ fontSize: "clamp(2.25rem, 1.3rem + 3vw, 4rem)", letterSpacing: "-0.045em" }} data-split="">
              {splitWords(title)}
            </h1>
            {subtitle && (
              <p className={cn("mt-3 text-lg font-semibold", dark ? "text-amber" : "text-brand-700")} data-aos="fade-up" data-aos-delay="150">
                {subtitle}
              </p>
            )}
            {intro && (
              <Html
                html={intro}
                className={cn("mt-3.5 max-w-2xl text-[1.075rem] leading-relaxed [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0", lay === "centered" && "mx-auto", dark ? "text-white/65" : "text-ink-500")}
                data-aos="fade-up"
                data-aos-delay="200"
              />
            )}
            <div className={cn("mt-6 flex flex-wrap gap-3", lay === "centered" && "justify-center")} data-aos="fade-up" data-aos-delay="280">
              {hasActions ? (
                actions || null
              ) : (
                <>
                  <a href="#enquire" className={cn("btn btn-lg group", dark ? "btn-light" : "btn-primary")} data-cta="hero-consultation" data-magnetic="">
                    Get a free consultation <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
                  </a>
                  {settings.phone && (
                    <a href={settings.phone_href ?? undefined} className={cn("btn btn-lg", dark ? "btn-ghost-dark" : "btn-secondary")}>
                      <Icon name="phone" className="size-4" /> {settings.phone}
                    </a>
                  )}
                </>
              )}
            </div>
            {rich && !hasActions && lay !== "centered" && (
              <ul className={cn("mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm", dark ? "text-white/60" : "text-ink-600")} role="list" data-aos="fade-up" data-aos-delay="340">
                {["Free consultation", "Transparent pricing", "Reply within 1 business day"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Icon name="check-circle" className={cn("size-4", dark ? "text-teal-200" : "text-teal")} /> {t}
                  </li>
                ))}
              </ul>
            )}
            {children}
          </div>

          {twoCol &&
            (form ? (
              <div className="relative w-full lg:justify-self-end" data-aos="fade-left" data-aos-delay="120">
                <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-teal/35 via-transparent to-amber/25 blur-3xl" />
                <LeadForm
                  className="relative"
                  compact
                  service={formService}
                  location={formLocation}
                  formName="page-hero"
                  title={formTitle}
                  subtitle={formSubtitle}
                />
              </div>
            ) : image && ["split", "dark"].includes(lay) ? (
              <div className="relative" data-aos="zoom-in" data-aos-delay="120">
                <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-teal/35 via-transparent to-amber/25 blur-3xl" />
                <div className={cn("relative overflow-hidden rounded-[1.75rem] shadow-2xl", dark ? "ring-1 ring-white/15" : "ring-1 ring-ink/5")}>
                  <Img media={image} priority sizes="(min-width:1024px) 480px, 100vw" className="aspect-[4/3] w-full object-cover" />
                </div>
              </div>
            ) : aside ? (
              <div className="relative w-full lg:justify-self-end">{aside}</div>
            ) : null)}
        </div>
      </div>
    </section>
  );
}

/** Pagination (components/pagination.blade.php) */
export function Pagination({ p }: { p: { current: number; last: number; prev: string | null; next: string | null; pages: { page: number; url: string }[] } }) {
  if (p.last <= 1) return null;
  // Same window as Laravel's onEachSide(1): first, last, current ±1, with "..." gaps.
  const show = p.pages.filter((x) => x.page === 1 || x.page === p.last || Math.abs(x.page - p.current) <= 1);
  const items: ({ page: number; url: string } | "gap")[] = [];
  show.forEach((x, i) => {
    if (i > 0 && x.page - show[i - 1].page > 1) items.push("gap");
    items.push(x);
  });
  return (
    <nav role="navigation" aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
      {p.prev ? (
        <Link href={p.prev} rel="prev" className="grid size-11 place-items-center rounded-xl border border-line hover:border-brand hover:text-brand" aria-label="Previous page">
          <Icon name="chevron-right" className="size-4 rotate-180" />
        </Link>
      ) : (
        <span className="grid size-11 place-items-center rounded-xl border border-line text-steel/50" aria-disabled="true">
          <Icon name="chevron-right" className="size-4 rotate-180" />
        </span>
      )}
      {items.map((x, i) =>
        x === "gap" ? (
          <span key={`g${i}`} className="px-2 text-steel">
            ...
          </span>
        ) : x.page === p.current ? (
          <span key={x.page} aria-current="page" className="grid size-11 place-items-center rounded-xl bg-brand font-semibold text-white">
            {x.page}
          </span>
        ) : (
          <Link key={x.page} href={x.url} className="grid size-11 place-items-center rounded-xl border border-line font-medium hover:border-brand hover:text-brand" aria-label={`Page ${x.page}`}>
            {x.page}
          </Link>
        ),
      )}
      {p.next ? (
        <Link href={p.next} rel="next" className="grid size-11 place-items-center rounded-xl border border-line hover:border-brand hover:text-brand" aria-label="Next page">
          <Icon name="chevron-right" className="size-4" />
        </Link>
      ) : (
        <span className="grid size-11 place-items-center rounded-xl border border-line text-steel/50" aria-disabled="true">
          <Icon name="chevron-right" className="size-4" />
        </span>
      )}
    </nav>
  );
}
