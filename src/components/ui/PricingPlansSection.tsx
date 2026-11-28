"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { MobileCardCarousel } from "@/components/ui/MobileCardCarousel";
import type { Block } from "@/lib/types";
import { cn } from "@/lib/utils";

type PricingPlan = {
  title: string;
  value: string;
  suffix?: string;
  text?: string;
  features?: string;
  featured?: boolean;
  url?: string;
  cta_text?: string;
  badge?: string;
};

export function PricingPlansSection({ pricingBlocks }: { pricingBlocks: Block[] }) {
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);

  if (!pricingBlocks || pricingBlocks.length === 0) return null;

  const currentBlock = pricingBlocks[activeTabIdx] || pricingBlocks[0];
  const plans = (currentBlock?.data?.items ?? []) as PricingPlan[];
  const eyebrow = currentBlock?.data?.eyebrow || "Our Pricing Plans";
  const subheading =
    currentBlock?.data?.subheading ||
    "All-inclusive plans with no hidden fees. Switch or cancel anytime. Every package includes a dedicated account manager.";

  return (
    <section className="py-8 sm:py-11" id="plans">
      <div className="container-x">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-5">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </span>
          <h2 className="mt-1.5 font-display text-2xl sm:text-4xl font-bold tracking-tight text-ink">
            Choose Your <span className="text-brand">Perfect Package</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-ink-600">{subheading}</p>
        </div>

        {/* Guarantee Box */}
        <div className="mx-auto max-w-3xl mb-6 rounded-2xl border border-brand/20 bg-brand-50/60 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3.5 shadow-xs">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-xs">
            <Icon name="shield-check" className="size-5" />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm font-bold text-ink">90 Days Guaranteed Results</p>
            <p className="text-xs text-ink-600 mt-0.5">
              Achieve visible growth and real performance improvements with our results-driven digital strategies.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        {pricingBlocks.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-6">
            {pricingBlocks.map((b, i) => {
              const isActive = activeTabIdx === i;
              const cleanLabel = (b.data?.heading || `Plan ${i + 1}`).replace(/packages?/i, "").trim();
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTabIdx(i)}
                  className={cn(
                    "rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200",
                    isActive
                      ? "bg-brand text-white shadow-xs ring-2 ring-brand/20 scale-102"
                      : "border border-line bg-white text-ink-700 hover:border-brand/40 hover:text-brand hover:bg-mist/50"
                  )}
                >
                  {cleanLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* Pricing Cards Grid (Desktop/Tablet) & Auto-Moving Single Card Dock (Mobile) */}
        <MobileCardCarousel
          resetKey={activeTabIdx}
          slideClassName="pt-4"
          gridClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch max-w-6xl mx-auto"
        >
          {plans.map((plan, i) => {
            const hot = Boolean(plan.featured);
            const features = String(plan.features ?? "").split(/\r?\n/).filter(Boolean);
            const ctaLabel = plan.cta_text?.trim() || "Get Started";
            const ctaHref = plan.url?.trim() || "/contact/";
            const enquiryId = `pricing-${String(plan.title ?? "plan").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

            return (
              <div
                key={i}
                className={cn(
                  "relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 transition-all duration-300",
                  hot
                    ? "border-2 border-brand bg-gradient-to-b from-brand-50/40 via-white to-white shadow-lg lg:-translate-y-1.5 ring-4 ring-brand/10"
                    : "border border-line bg-white shadow-xs hover:border-brand/30 hover:shadow-md"
                )}
              >
                {hot && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3.5 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-white shadow-xs">
                    {plan.badge?.trim() || "⭐ Most Popular"}
                  </span>
                )}

                <div>
                  {/* Header */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={cn("text-xl font-bold font-display", hot ? "text-brand" : "text-ink")}>
                      {plan.title}
                    </h3>
                    {hot && (
                      <span className="text-[0.65rem] font-bold uppercase tracking-wider text-teal bg-teal/10 rounded-full px-2 py-0.5">
                        Recommended
                      </span>
                    )}
                  </div>

                  {plan.text && (
                    <p className="mt-1.5 text-xs text-ink-500 leading-snug">{plan.text}</p>
                  )}

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-line/70">
                    <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-ink">
                      {plan.value}
                    </span>
                    {plan.suffix && (
                      <span className="text-xs sm:text-sm font-medium text-ink-500">{plan.suffix}</span>
                    )}
                  </div>

                  {/* Features list */}
                  <div className="mt-6">
                    <p className="text-[0.72rem] font-bold uppercase tracking-wider text-ink-400 mb-3">
                      What’s Included:
                    </p>
                    <ul className="grid gap-2.5" role="list">
                      {features.map((feat, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-ink-700">
                          <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand mt-0.5">
                            <Icon name="check" className="size-3" />
                          </span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8 pt-4">
                  {ctaHref === "#enquiry-popup" ? (
                    <button
                      type="button"
                      className={cn("btn w-full", hot ? "btn-primary" : "btn-dark")}
                      data-enquiry={enquiryId}
                    >
                      {ctaLabel} <Icon name="arrow-right" className="size-3.5" />
                    </button>
                  ) : (
                    <Link
                      href={ctaHref}
                      className={cn("btn w-full", hot ? "btn-primary" : "btn-dark")}
                      data-enquiry={enquiryId}
                    >
                      {ctaLabel} <Icon name="arrow-right" className="size-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </MobileCardCarousel>

        <p className="mt-8 text-center text-xs text-ink-400">
          * All pricing excludes 18% GST. Custom plans and enterprise deliverables are available upon consultation.
        </p>
      </div>
    </section>
  );
}
