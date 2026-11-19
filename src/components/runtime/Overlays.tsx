"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { LeadForm } from "@/components/forms/LeadForm";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { BrandSquares } from "@/components/ui/basics";
import { cn, highlight, lines } from "@/lib/utils";
import { useSite } from "./site-context";

/** Global enquiry popup + video lightbox + desktop "Free Quote" tab (port of components/enquiry-modal.blade.php). */
export function Overlays() {
  const { layout, enquiryOpen, closeEnquiry, video, closeVideo } = useSite();
  const s = layout.settings;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!enquiryOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => prev?.focus?.();
  }, [enquiryOpen]);

  return (
    <>
      {enquiryOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="enquiry-popup-title">
          <div className="overlay-fade absolute inset-0 bg-brand-700/35 backdrop-blur-sm" onClick={closeEnquiry} />
          <div className="overlay-rise relative grid max-h-[94vh] w-full max-w-[820px] overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem] md:grid-cols-[0.95fr_1.05fr]">
            <button ref={closeRef} type="button" onClick={closeEnquiry} className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:rotate-90 hover:bg-white" aria-label="Close">
              <Icon name="x" className="size-5" />
            </button>

            {/* Visual side */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand to-teal p-8 text-white md:flex md:flex-col">
              {s.popup_image && <Img media={s.popup_image} sizes="400px" className="absolute inset-0 size-full object-cover opacity-35 mix-blend-luminosity" alt="" />}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-700/85 via-brand/50 to-teal/20" />
              <div className="glow-amber absolute -left-20 -top-20 size-72" />
              <div className="relative">
                <BrandSquares />
              </div>
              <div className="relative mt-auto pt-24">
                {s.popup_badge && (
                  <span className="badge-pill border-white/30 bg-white/20 text-white backdrop-blur">
                    <Icon name="sparkles" className="size-3.5" /> {s.popup_badge}
                  </span>
                )}
                <ul className="mt-6 grid gap-3" role="list">
                  {lines(s.popup_points).map((p) => (
                    <li key={p} className="flex items-center gap-3 text-[0.95rem] font-medium">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-brand">
                        <Icon name="check" className="size-3.5" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                {s.phone && (
                  <a href={s.phone_href ?? undefined} className="mt-8 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-3.5 backdrop-blur transition hover:bg-white/25">
                    <span className="grid size-10 place-items-center rounded-xl bg-white text-brand">
                      <Icon name="phone" className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-xs text-white/80">Prefer to talk?</span>
                      <span className="block font-semibold">{s.phone}</span>
                    </span>
                  </a>
                )}
              </div>
            </div>

            {/* Form side */}
            <div className="p-6 pt-8 sm:p-9">
              {s.popup_badge && <span className="badge-pill border-brand/20 bg-brand-50 text-brand-700 md:hidden">{s.popup_badge}</span>}
              <h2 id="enquiry-popup-title" className="mt-3 pr-10 text-[1.6rem] font-extrabold leading-tight md:mt-0" style={{ letterSpacing: "-0.03em" }}>
                {highlight(s.popup_title)}
              </h2>
              {s.popup_text && <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-500">{s.popup_text}</p>}
              <LeadForm mini bare title="" formName="popup" button="Get my free plan" className="mt-6 !max-w-none" />
            </div>
          </div>
        </div>
      )}

      {video.open && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Video">
          <div className="overlay-fade absolute inset-0 bg-ink/80 backdrop-blur" onClick={closeVideo} />
          <div className="overlay-rise relative aspect-video w-full max-w-5xl overflow-hidden rounded-[1.5rem] bg-black shadow-2xl">
            {video.youtube ? (
              <iframe className="absolute inset-0 size-full" src={`https://www.youtube-nocookie.com/embed/${video.youtube}?autoplay=1&rel=0`} title="Video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            ) : (
              <video className="absolute inset-0 size-full" src={video.src} autoPlay controls playsInline />
            )}
          </div>
          <button type="button" onClick={closeVideo} className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20" aria-label="Close video">
            <Icon name="x" className="size-5" />
          </button>
        </div>
      )}

      {s.quote_tab_enabled && (
        <button
          type="button"
          data-enquiry="side-tab"
          className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 origin-bottom-right items-center gap-2 rounded-l-2xl bg-brand px-3 py-4 text-sm font-bold text-white shadow-[var(--shadow-glow)] transition hover:bg-brand-600 hover:pr-4 lg:flex [writing-mode:vertical-rl]"
        >
          <Icon name="sparkles" className="size-4 rotate-90" /> Free Quote
        </button>
      )}
    </>
  );
}

/** <x-whatsapp-button> + <x-call-button> (mobile action bar). */
export function FloatingActions() {
  const { layout } = useSite();
  const s = layout.settings;
  const wa = s.whatsapp_enabled ? s.whatsapp_url : null;
  const left = s.whatsapp_position === "left";
  const callNumber = s.call_href;

  return (
    <>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener"
          className={cn(
            "group fixed bottom-20 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgb(37_211_102/0.6)] transition hover:scale-105 md:bottom-6",
            left ? "left-4 md:left-6" : "right-4 md:right-6",
          )}
          aria-label="Chat with us on WhatsApp"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 motion-reduce:hidden" />
          <Icon name="whatsapp" className="relative size-7" />
          <span className={cn("pointer-events-none absolute hidden whitespace-nowrap rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium opacity-0 transition group-hover:opacity-100 md:block", left ? "left-16" : "right-16")}>Chat on WhatsApp</span>
        </a>
      )}
      {s.call_enabled && callNumber && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line bg-white/95 p-2 backdrop-blur md:hidden" style={{ paddingBottom: "max(.5rem, env(safe-area-inset-bottom))" }}>
            <a href={callNumber} className="btn btn-secondary w-full" aria-label={`Call ${s.phone ?? ""}`}>
              <Icon name="phone" className="size-4 text-brand" /> {s.call_text || "Call Now"}
            </a>
            <Link href="/contact/" className="btn btn-primary w-full" data-enquiry="mobile-bar">
              Enquire Now
            </Link>
          </div>
          <div className="h-16 md:hidden" aria-hidden="true" />
        </>
      )}
    </>
  );
}
