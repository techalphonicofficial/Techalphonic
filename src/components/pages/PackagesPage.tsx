import Link from "next/link";
import { Blocks } from "@/components/blocks/Blocks";
import { Html } from "@/components/ui/basics";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { PricingPlansSection } from "@/components/ui/PricingPlansSection";
import { FaqSection } from "@/components/ui/sections";
import { getLayout } from "@/lib/api";
import type { PageData, Seo } from "@/lib/types";
import { cn, highlight } from "@/lib/utils";

const DEFAULT_STATS = [
  { value: "7+", label: "Years of Experience" },
  { value: "1.5k", label: "Projects Completed" },
  { value: "60+", label: "Team of Experts" },
  { value: "100%", label: "Satisfied Clients" },
];

const DEFAULT_TRUST_POINTS = [
  {
    icon: "trending-up",
    title: "Proven ROI Results",
    text: "Average 3x ROI for our clients within 6 months. We deliver with data-backed, conversion-focused strategies.",
  },
  {
    icon: "user-check",
    title: "Dedicated Account Manager",
    text: "Single point of contact for your project. No tickets, no delays — direct communication and fast execution.",
  },
  {
    icon: "file-text",
    title: "Transparent Reporting",
    text: "Weekly and monthly reports with clear ranking, traffic, lead, and revenue metrics. You always know what's happening.",
  },
  {
    icon: "shield-check",
    title: "No Long-Term Lock-in",
    text: "Flexible month-to-month plans with zero hidden fees. Cancel anytime with a 30-day notice. We earn your trust every month.",
  },
  {
    icon: "sparkles",
    title: "AI-Powered Strategies",
    text: "We leverage cutting-edge AI tools for SEO, content creation, and ad optimization to keep you ahead of competitors.",
  },
  {
    icon: "award",
    title: "Industry Expertise",
    text: "7+ years across 20+ industries — healthcare, e-commerce, real estate, finance, education, logistics, and SaaS.",
  },
];

export async function PackagesPage({ data }: { data: PageData; seo: Seo }) {
  const { page, blocks, faqs = [], testimonials = [], links } = data;
  const { settings } = await getLayout();

  // Structured blocks mapped directly from Admin Page Builder
  const pricingBlocks = blocks.filter((b) => b.type === "pricing");
  const statsBlock = blocks.find((b) => b.type === "statistics");
  const featureBlocks = blocks.filter((b) => b.type === "feature_cards");
  const addOnsBlock = featureBlocks[0];
  const trustBlock = featureBlocks[1];
  const processBlock = blocks.find((b) => b.type === "process");
  const testimonialsBlock = blocks.find((b) => b.type === "testimonials");
  const ctaBlock = blocks.find((b) => b.type === "cta");
  const handledTypes = new Set(["pricing", "statistics", "feature_cards", "process", "testimonials", "cta"]);
  const extraBlocks = blocks.filter((b) => !handledTypes.has(b.type));

  const rawStats = (statsBlock?.data?.items ?? []) as Array<{ value?: string; suffix?: string; title?: string; label?: string }>;
  const stats =
    rawStats.length > 0
      ? rawStats.map((st) => ({
          value: `${st.value ?? ""}${st.suffix ?? ""}`,
          label: st.title ?? st.label ?? "",
        }))
      : DEFAULT_STATS;

  const addOns = (addOnsBlock?.data?.items ?? []) as Array<{
    title: string;
    text: string;
    icon?: string;
  }>;

  const processSteps = (processBlock?.data?.items ?? []) as Array<{
    title: string;
    text: string;
  }>;

  const rawTrustPoints = (trustBlock?.data?.items ?? []) as Array<{
    icon?: string;
    title: string;
    text: string;
  }>;
  const trustPoints = rawTrustPoints.length > 0 ? rawTrustPoints : DEFAULT_TRUST_POINTS;

  const testimonialLimit = Math.max(1, Number(testimonialsBlock?.data?.limit) || 3);
  const ctaEyebrow = ctaBlock?.data?.eyebrow || "Fast Consultation";
  const ctaHeading = ctaBlock?.data?.heading || "Ready to Build Your Dream Project?";
  const ctaText =
    ctaBlock?.data?.text ||
    ctaBlock?.data?.subheading ||
    "Book a free 30-minute consultation call with our solution architect and get a tailored growth strategy.";
  const ctaButtonText = ctaBlock?.data?.cta_text || ctaBlock?.data?.primary_text || "Book a Free Consultation";
  const ctaButtonUrl = ctaBlock?.data?.cta_url || ctaBlock?.data?.primary_url || links.contact || "/contact/";
  const contactHref = links.contact || "/contact/";

  return (
    <div className="bg-white">
      {/* 1. Hero Section - Styled in TechAlphonic Theme */}
      <section className="relative overflow-hidden border-b border-line/80 bg-gradient-to-b from-mist/70 via-white to-mist/30 py-9 sm:py-12">
        {/* Subtle background glow */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-96 rounded-full bg-brand/10 blur-3xl" />
        </div>

        <div className="container-x relative">
          <div className="mx-auto max-w-3xl text-center">
            {/* Eyebrow badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-50/80 px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-[0.16em] text-brand mb-4">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
              </span>
              {page.hero_subheading || "Transparent & Honest Pricing"}
            </span>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl sm:leading-[1.15]">
              {highlight(page.heading || "Affordable Packages for [[Every Business Goal]]")}
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base max-w-2xl mx-auto">
              {page.excerpt ||
                "Transparent, results-oriented pricing — choose the best plan across SEO, Social Media, Website Development, Paid Ads, or custom hybrid packages. Switch or cancel anytime."}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#plans" className="btn btn-primary">
                View All Packages <Icon name="arrow-right" className="size-4" />
              </a>
              <Link href={contactHref} className="btn btn-secondary">
                Talk to an Expert
              </Link>
            </div>
          </div>

          {/* 2. Stats Bar */}
          {stats.length > 0 && (
            <div className="mt-8 sm:mt-10 rounded-2xl border border-line bg-white/90 p-5 sm:p-6 shadow-xs backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-line sm:grid-cols-4">
                {stats.map((st, i) => (
                  <div key={i} className={cn("text-center", i > 1 ? "pt-4 sm:pt-0" : "")}>
                    <p className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                      <span className="text-brand">{st.value}</span>
                    </p>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-ink-500">{st.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Main Pricing Section with Interactive Category Tabs */}
      <PricingPlansSection pricingBlocks={pricingBlocks} />

      {/* 4. Optional Add-Ons Section */}
      {addOns.length > 0 && (
        <section className="py-8 sm:py-10 bg-gradient-to-b from-mist/50 via-mist/30 to-white border-t border-line/80">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {addOnsBlock?.data?.eyebrow || "Customize Your Plan"}
              </span>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {highlight(addOnsBlock?.data?.heading || "Optional [[Add-Ons]]")}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-600">
                {addOnsBlock?.data?.subheading ||
                  "Enhance your core package with powerful add-on capabilities tailored to your specific business requirements."}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {addOns.map((addon, i) => (
                <div
                  key={i}
                  className="group rounded-xl border border-line bg-white p-4.5 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-sm"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                    <Icon name={addon.icon || "sparkles"} className="size-4" />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-ink group-hover:text-brand transition-colors">
                    {addon.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-500 leading-snug">{addon.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Get Started in 4 Simple Steps */}
      {processSteps.length > 0 && (
        <section className="py-8 sm:py-10 border-t border-line/80">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {processBlock?.data?.eyebrow || "Simple Workflow"}
              </span>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {highlight(processBlock?.data?.heading || "Get Started in [[4 Simple Steps]]")}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-600">
                {processBlock?.data?.subheading ||
                  "From consultation to real outcomes — transparent onboarding with no friction."}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {processSteps.map((step, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl border border-line bg-white p-5 shadow-xs transition hover:border-brand/30"
                >
                  <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand-50 text-xs font-extrabold text-brand mb-3">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-sm sm:text-base font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-xs text-ink-500 leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Why Clients Trust Us */}
      {trustPoints.length > 0 && (
        <section className="py-8 sm:py-10 bg-mist/40 border-t border-line/80">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {trustBlock?.data?.eyebrow || "Why TechAlphonic"}
              </span>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {highlight(trustBlock?.data?.heading || "Why [[1000+ Clients]] Trust Us")}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-600">
                {trustBlock?.data?.subheading ||
                  "We’re not just an agency — we’re your long-term digital growth and engineering partner."}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {trustPoints.map((pt, i) => (
                <div key={i} className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand mb-3.5">
                    <Icon name={pt.icon || "shield-check"} className="size-4.5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-ink">{pt.title}</h3>
                  <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">{pt.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Extra Page Builder blocks & rich body if configured in Admin */}
      {extraBlocks.length > 0 && <Blocks blocks={extraBlocks} />}
      {page.content && page.content.trim().length > 0 && (
        <section className="py-8 sm:py-10 border-t border-line/80">
          <div className="container-x max-w-4xl">
            <Html html={page.content} className="prose-content" />
          </div>
        </section>
      )}

      {/* 7. What Our Clients Say (Testimonials) */}
      {testimonials.length > 0 && (
        <section className="py-8 sm:py-10 border-t border-line/80">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                {testimonialsBlock?.data?.eyebrow || "Client Testimonials"}
              </span>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {highlight(testimonialsBlock?.data?.heading || "What Our [[Clients Say]]")}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-600">
                {testimonialsBlock?.data?.subheading || "Real feedback from businesses scaling with TechAlphonic."}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
              {testimonials.slice(0, testimonialLimit).map((t, i) => (
                <div key={i} className="flex flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-xs">
                  <div>
                    <div className="flex items-center gap-1 text-amber mb-3">
                      {[...Array(Math.max(1, Math.min(5, t.rating || 5)))].map((_, starIdx) => (
                        <Icon key={starIdx} name="star" className="size-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-ink-700 italic leading-relaxed">
                      &ldquo;{t.review}&rdquo;
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-3 border-t border-line/60 pt-3">
                    {t.photo && (
                      <Img media={t.photo} sizes="36px" className="size-9 rounded-full object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-ink truncate">{t.name}</p>
                      <p className="text-[0.7rem] text-ink-400 truncate">
                        {[t.designation, t.company].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Dark Mesh Banner CTA */}
      <section className="section-dark noise py-8 sm:py-11 relative overflow-hidden">
        <div className="mesh">
          <span className="-right-20 -top-20 size-72 bg-teal/35" />
          <span className="-bottom-24 -left-16 size-64 bg-amber/20 [animation-delay:-7s]" />
        </div>
        <div className="container-x relative text-center">
          <span className="badge-pill w-max mx-auto border-white/15 bg-white/10 text-amber mb-3">
            <Icon name="sparkles" className="size-3.5" /> {ctaEyebrow}
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            {highlight(ctaHeading)}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/70 max-w-xl mx-auto">
            {ctaText}
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            {ctaButtonUrl === "#enquiry-popup" ? (
              <button type="button" className="btn btn-light" data-enquiry="packages-cta">
                {ctaButtonText} <Icon name="arrow-right" className="size-3.5" />
              </button>
            ) : (
              <Link href={ctaButtonUrl} className="btn btn-light">
                {ctaButtonText} <Icon name="arrow-right" className="size-3.5" />
              </Link>
            )}
            {settings.phone_href && (
              <a href={settings.phone_href} className="btn btn-ghost text-white border-white/20 hover:bg-white/10">
                <Icon name="phone" className="size-3.5" /> Call Sales
              </a>
            )}
          </div>
        </div>
      </section>

      {/* 9. FAQs Section */}
      {faqs.length > 0 && <FaqSection faqs={faqs} />}
    </div>
  );
}
