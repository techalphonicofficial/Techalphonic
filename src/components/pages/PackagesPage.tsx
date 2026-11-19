import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FaqSection } from "@/components/ui/sections";
import { PricingPlansSection } from "@/components/ui/PricingPlansSection";
import type { PageData, Seo } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "10+", label: "Years of Experience" },
  { value: "1.5k", label: "Projects Completed" },
  { value: "60+", label: "Team of Experts" },
  { value: "100%", label: "Satisfied Clients" },
];

const TRUST_POINTS = [
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
  const { blocks, faqs = [], testimonials = [] } = data;

  // Extract all pricing blocks
  const pricingBlocks = blocks.filter((b) => b.type === "pricing");

  // Extract add-ons block
  const addOnsBlock = blocks.find((b) => b.type === "feature_cards");
  const addOns = (addOnsBlock?.data?.items ?? []) as Array<{
    title: string;
    text: string;
    icon?: string;
  }>;

  // Extract process block
  const processBlock = blocks.find((b) => b.type === "process");
  const processSteps = (processBlock?.data?.items ?? []) as Array<{
    title: string;
    text: string;
  }>;

  return (
    <div className="bg-white">
      {/* 1. Hero Section - Styled in TechAlphonic Theme */}
      <section className="relative overflow-hidden border-b border-line/80 bg-gradient-to-b from-mist/70 via-white to-mist/30 py-16 sm:py-24">
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
              Transparent & Honest Pricing
            </span>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-5xl sm:leading-[1.15]">
              Affordable Packages for{" "}
              <span className="bg-gradient-to-r from-brand to-teal bg-clip-text text-transparent">
                Every Business Goal
              </span>
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-ink-600 sm:text-base max-w-2xl mx-auto">
              Transparent, results-oriented pricing — choose the best plan across SEO, Social Media, Website
              Development, Paid Ads, or custom hybrid packages. Switch or cancel anytime.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#plans" className="btn btn-primary">
                View All Packages <Icon name="arrow-right" className="size-4" />
              </a>
              <Link href="/contact/" className="btn btn-secondary">
                Talk to an Expert
              </Link>
            </div>
          </div>

          {/* 2. Stats Bar */}
          <div className="mt-14 sm:mt-18 rounded-2xl border border-line bg-white/90 p-5 sm:p-7 shadow-xs backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-line sm:grid-cols-4">
              {STATS.map((st, i) => (
                <div key={i} className={cn("text-center", i > 1 ? "pt-4 sm:pt-0" : "")}>
                  <p className="font-display text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                    <span className="text-brand">{st.value}</span>
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-ink-500">{st.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Pricing Section with Interactive Category Tabs */}
      <PricingPlansSection pricingBlocks={pricingBlocks} />

      {/* 4. Optional Add-Ons Section */}
      {addOns.length > 0 && (
        <section className="py-14 sm:py-18 bg-gradient-to-b from-mist/50 via-mist/30 to-white border-t border-line/80">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                Customize Your Plan
              </span>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Optional <span className="text-brand">Add-Ons</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-600">
                Enhance your core package with powerful add-on capabilities tailored to your specific business requirements.
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
        <section className="py-14 sm:py-18 border-t border-line/80">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                Simple Workflow
              </span>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                Get Started in <span className="text-brand">4 Simple Steps</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-600">
                From consultation to real outcomes — transparent onboarding with no friction.
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

      {/* 6. Why 1000+ Clients Trust Us */}
      <section className="py-14 sm:py-18 bg-mist/40 border-t border-line/80">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              Why TechAlphonic
            </span>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Why <span className="text-brand">1000+ Clients</span> Trust Us
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-ink-600">
              We’re not just an agency — we’re your long-term digital growth and engineering partner.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {TRUST_POINTS.map((pt, i) => (
              <div key={i} className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex size-9 items-center justify-center rounded-lg bg-brand-50 text-brand mb-3.5">
                  <Icon name={pt.icon} className="size-4.5" />
                </div>
                <h3 className="font-display text-base font-bold text-ink">{pt.title}</h3>
                <p className="mt-1.5 text-xs text-ink-600 leading-relaxed">{pt.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. What Our Clients Say (Testimonials) */}
      {testimonials.length > 0 && (
        <section className="py-14 sm:py-18 border-t border-line/80">
          <div className="container-x">
            <div className="mx-auto max-w-2xl text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                Client Testimonials
              </span>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                What Our <span className="text-brand">Clients Say</span>
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-ink-600">
                Real feedback from businesses scaling with TechAlphonic.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
              {testimonials.slice(0, 3).map((t, i) => (
                <div key={i} className="flex flex-col justify-between rounded-2xl border border-line bg-white p-6 shadow-xs">
                  <div>
                    <div className="flex items-center gap-1 text-amber mb-3">
                      {[...Array(5)].map((_, starIdx) => (
                        <Icon key={starIdx} name="star" className="size-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-ink-700 italic leading-relaxed">
                      &ldquo;{t.review}&rdquo;
                    </p>
                  </div>
                  <div className="mt-5 border-t border-line/60 pt-3">
                    <p className="font-bold text-xs text-ink">{t.name}</p>
                    <p className="text-[0.7rem] text-ink-400">{[t.designation, t.company].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. Dark Mesh Banner CTA */}
      <section className="section-dark noise py-14 sm:py-18 relative overflow-hidden">
        <div className="mesh">
          <span className="-right-20 -top-20 size-72 bg-teal/35" />
          <span className="-bottom-24 -left-16 size-64 bg-amber/20 [animation-delay:-7s]" />
        </div>
        <div className="container-x relative text-center">
          <span className="badge-pill w-max mx-auto border-white/15 bg-white/10 text-amber mb-3">
            <Icon name="sparkles" className="size-3.5" /> Fast Consultation
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Ready to Build Your Dream Project?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/70 max-w-xl mx-auto">
            Book a free 30-minute consultation call with our solution architect and get a tailored growth strategy.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact/" className="btn btn-light">
              Book a Free Consultation <Icon name="arrow-right" className="size-3.5" />
            </Link>
            <a href="tel:+919899184918" className="btn btn-ghost text-white border-white/20 hover:bg-white/10">
              <Icon name="phone" className="size-3.5" /> Call Sales
            </a>
          </div>
        </div>
      </section>

      {/* 9. FAQs Section */}
      {faqs.length > 0 && <FaqSection faqs={faqs} />}
    </div>
  );
}
