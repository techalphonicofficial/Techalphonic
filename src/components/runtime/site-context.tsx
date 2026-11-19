"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Layout } from "@/lib/types";
import { youtubeId } from "@/lib/utils";

/*
 * Client-side site state (replaces the Alpine stores in the Blade build): layout settings for forms,
 * the enquiry popup and the video lightbox.
 */

export const storage = {
  get(store: "localStorage" | "sessionStorage", k: string): string | null {
    try {
      return window[store].getItem(k);
    } catch {
      return null;
    }
  },
  set(store: "localStorage" | "sessionStorage", k: string, v: string) {
    try {
      window[store].setItem(k, v);
    } catch {}
  },
};

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    __taReady?: boolean;
    grecaptcha?: { ready(cb: () => void): void; execute(key: string, opts: { action: string }): Promise<string> };
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, page_path: location.pathname, ...params });
}

type Video = { open: boolean; src: string; youtube: string | null };

type Ctx = {
  layout: Layout;
  enquiryOpen: boolean;
  openEnquiry: (source?: string) => void;
  closeEnquiry: () => void;
  video: Video;
  openVideo: (src: string) => void;
  closeVideo: () => void;
};

const SiteContext = createContext<Ctx | null>(null);

export function useSite(): Ctx {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}

export function SiteProvider({ layout, children }: { layout: Layout; children: ReactNode }) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [video, setVideo] = useState<Video>({ open: false, src: "", youtube: null });

  const openEnquiry = useCallback((source = "cta") => {
    storage.set("sessionStorage", "ta_popup_seen", "1");
    document.documentElement.classList.add("overflow-hidden");
    setEnquiryOpen(true);
    track("cta_click", { cta_label: "popup:" + source });
  }, []);

  const closeEnquiry = useCallback(() => {
    document.documentElement.classList.remove("overflow-hidden");
    setEnquiryOpen(false);
  }, []);

  const openVideo = useCallback((src: string) => {
    document.documentElement.classList.add("overflow-hidden");
    setVideo({ open: true, src, youtube: youtubeId(src) });
    track("cta_click", { cta_label: "video" });
  }, []);

  const closeVideo = useCallback(() => {
    document.documentElement.classList.remove("overflow-hidden");
    setVideo({ open: false, src: "", youtube: null });
  }, []);

  const value = useMemo(
    () => ({ layout, enquiryOpen, openEnquiry, closeEnquiry, video, openVideo, closeVideo }),
    [layout, enquiryOpen, openEnquiry, closeEnquiry, video, openVideo, closeVideo],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
