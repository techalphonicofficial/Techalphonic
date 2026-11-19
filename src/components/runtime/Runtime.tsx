"use client";

import { useEffect } from "react";
import { storage, track, useSite } from "./site-context";

/*
 * Page behaviour shared by every page (port of resources/js/app.js):
 *  - scroll reveals for [data-reveal] / [data-aos] / [data-split] (CSS animations in globals.css)
 *  - cursor spotlight on .spotlight cards and magnetic [data-magnetic] buttons
 *  - conversion tracking (phone, WhatsApp, CTA clicks) into dataLayer
 *  - [data-enquiry] / #enquiry-popup links open the popup, [data-video] opens the lightbox
 *  - automatic popup (timer / exit intent), first-touch UTM capture
 * Markup keeps the Blade data attributes, so templates were ported without behavioural changes.
 */
/**
 * Scroll reveals. Rendered as the last child of every page: its effect runs only after the whole page
 * subtree has hydrated, so adding classes/styles can never cause a hydration mismatch.
 */
export function RevealScope() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io =
      !reduce && "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                if (!e.isIntersecting) return;
                e.target.classList.add("is-in");
                io?.unobserve(e.target);
              }),
            { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
          )
        : null;

    // Tracked per effect run (not with a DOM marker) so a re-run after cleanup observes everything again.
    const seen = new WeakSet<Element>();
    const prepare = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-aos], [data-split]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.classList.contains("is-in")) return;
        let delay = el.dataset.aosDelay;
        if (!delay && el.dataset.reveal === "stagger" && el.parentElement) {
          const n = Array.from(el.parentElement.children).filter((c) => (c as HTMLElement).dataset.reveal === "stagger").indexOf(el);
          delay = String(Math.min(Math.max(n, 0), 5) * 80);
        }
        if (delay) el.style.setProperty("--d", delay + "ms");
        if (io) io.observe(el);
        else el.classList.add("is-in");
      });
    };

    prepare();
    // Content added later (tab panels, accordions, client navigations) is picked up as it appears.
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(prepare);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io?.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}

export function Runtime() {
  const { layout, openEnquiry, openVideo, closeEnquiry, closeVideo, enquiryOpen, video } = useSite();

  useEffect(() => {
    window.__taReady = true;
  }, []);

  // Spotlight + magnetic buttons (fine pointers only).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let magnet: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const m = target?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== m) magnet.style.translate = "";
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
      }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const card = target?.closest?.<HTMLElement>(".spotlight");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    const leave = () => {
      if (magnet) magnet.style.translate = "";
      magnet = null;
    };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  // Click delegation: popup / video triggers + conversion tracking.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("a, button");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      if (el.matches("[data-enquiry], a[href$='#enquiry-popup']")) {
        e.preventDefault();
        openEnquiry(el.dataset.enquiry || el.dataset.cta || "link");
        return;
      }
      if (el.dataset.video !== undefined) {
        e.preventDefault();
        openVideo(el.dataset.video);
        return;
      }
      if (href.startsWith("tel:")) track("phone_click", { link_url: href, link_text: (el.textContent || "").trim().slice(0, 60) });
      else if (href.includes("wa.me") || href.includes("whatsapp.com")) track("whatsapp_click", { link_url: href });
      else if (el.dataset.cta !== undefined) track("cta_click", { cta_label: el.dataset.cta || (el.textContent || "").trim().slice(0, 60), link_url: href });
    };
    // Capture phase so the popup opens before <Link> starts a navigation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [openEnquiry, openVideo]);

  useEffect(() => {
    if (!enquiryOpen && !video.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closeEnquiry();
      closeVideo();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enquiryOpen, video.open, closeEnquiry, closeVideo]);

  // First-touch UTM parameters, sent along with the lead form.
  useEffect(() => {
    if (storage.get("sessionStorage", "ta_utm")) return;
    const params = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid"]) {
      const v = params.get(k);
      if (v) utm[k] = v.slice(0, 150);
    }
    if (Object.keys(utm).length) storage.set("sessionStorage", "ta_utm", JSON.stringify(utm));
  }, []);

  // Automatic popup: once per visit, never after an enquiry, after N seconds or on exit intent (desktop).
  useEffect(() => {
    const s = layout.settings;
    if (!s.popup_enabled) return;
    if (storage.get("sessionStorage", "ta_popup_seen") || storage.get("localStorage", "ta_enquired")) return;
    const fire = (src: string) => {
      if (storage.get("sessionStorage", "ta_popup_seen") || document.documentElement.classList.contains("overflow-hidden")) return;
      openEnquiry(src);
    };
    const delay = Math.max(5, parseInt(String(s.popup_delay ?? 25), 10) || 25) * 1000;
    const timer = window.setTimeout(() => fire("timer"), delay);
    const exit = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) fire("exit-intent");
    };
    if (window.matchMedia("(pointer: fine)").matches) document.addEventListener("mouseout", exit);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseout", exit);
    };
  }, [layout.settings, openEnquiry]);

  return null;
}
