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
            { rootMargin: "0px 0px -4% 0px", threshold: 0.05 },
          )
        : null;

    // Tracked per effect run (not with a DOM marker) so a re-run after cleanup observes everything again.
    const seen = new WeakSet<Element>();
    const vh = window.innerHeight || 800;
    const prepare = (initial = false) => {
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-aos], [data-split]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (el.classList.contains("is-in")) return;
        // Elements already in or above the viewport on load stay immediately visible with zero flash/clip.
        if (initial && el.getBoundingClientRect().top < vh * 0.95) {
          el.classList.add("is-in", "is-instant");
          return;
        }
        let delay = el.dataset.aosDelay;
        if (!delay && el.dataset.reveal === "stagger" && el.parentElement) {
          const n = Array.from(el.parentElement.children).filter((c) => (c as HTMLElement).dataset.reveal === "stagger").indexOf(el);
          delay = String(Math.min(Math.max(n, 0), 5) * 60);
        }
        if (delay) el.style.setProperty("--d", delay + "ms");
        if (io) io.observe(el);
        else el.classList.add("is-in");
      });
    };

    prepare(true);
    document.documentElement.classList.add("js");

    // If the logo image is not available, show its clean alt text without the static BrandSquares icon.
    const handleLogoError = (img: HTMLImageElement) => {
      if (!img.hasAttribute("data-logo-img")) return;
      img.classList.add("hidden");
      img.parentElement?.querySelector("[data-logo-fallback]")?.classList.remove("hidden");
    };
    document.querySelectorAll<HTMLImageElement>("img[data-logo-img]").forEach((img) => {
      if (img.complete && img.naturalWidth === 0) handleLogoError(img);
    });
    const onImgError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) handleLogoError(e.target);
    };
    document.addEventListener("error", onImgError, true);

    // Only re-scan when actual element nodes are inserted (ignores CountUp text mutations).
    let raf = 0;
    const mo = new MutationObserver((mutations) => {
      let hasElements = false;
      for (const m of mutations) {
        for (let i = 0; i < m.addedNodes.length; i++) {
          if (m.addedNodes[i].nodeType === 1) {
            hasElements = true;
            break;
          }
        }
        if (hasElements) break;
      }
      if (!hasElements) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => prepare(false));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener("error", onImgError, true);
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

  // Pause decorative hero background videos when scrolled off-screen to keep main/compositor threads light.
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const videos = document.querySelectorAll<HTMLVideoElement>("video[data-hero-video]");
    if (!videos.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const vid = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) vid.play().catch(() => {});
          else vid.pause();
        });
      },
      { threshold: 0.01 },
    );
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  // Spotlight + magnetic buttons (fine pointers only, paused during active scroll to avoid layout/paint lag).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let scrolling = false;
    let scrollTimer = 0;
    let magnet: HTMLElement | null = null;
    let lastX = 0;
    let lastY = 0;
    let lastTarget: Element | null = null;

    const onScroll = () => {
      scrolling = true;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        scrolling = false;
      }, 120);
    };

    const move = (e: PointerEvent) => {
      if (scrolling) return;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTarget = e.target as Element | null;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (scrolling) return;
        const m = lastTarget?.closest?.<HTMLElement>("[data-magnetic]") ?? null;
        if (magnet && magnet !== m) magnet.style.translate = "";
        magnet = m;
        if (m) {
          const r = m.getBoundingClientRect();
          m.style.translate = `${(lastX - r.left - r.width / 2) * 0.22}px ${(lastY - r.top - r.height / 2) * 0.3}px`;
        }
        const card = lastTarget?.closest?.<HTMLElement>(".spotlight");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${Math.round(lastX - r.left)}px`);
        card.style.setProperty("--my", `${Math.round(lastY - r.top)}px`);
      });
    };
    const leave = () => {
      if (magnet) magnet.style.translate = "";
      magnet = null;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(scrollTimer);
      cancelAnimationFrame(raf);
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
