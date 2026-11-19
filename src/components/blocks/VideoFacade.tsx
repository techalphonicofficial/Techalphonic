"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import type { Media } from "@/lib/types";

/** Click-to-load YouTube facade: no YouTube JS until the visitor presses play (protects LCP/INP). */
export function VideoFacade({ id, title, poster }: { id: string; title: string; poster?: Media | null }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative mx-auto aspect-video max-w-4xl overflow-hidden rounded-3xl bg-brand-50 shadow-[var(--shadow-lift)]">
      {play ? (
        <iframe className="absolute inset-0 size-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 grid place-items-center" aria-label="Play video">
          {poster ? (
            <Img media={poster} className="absolute inset-0 size-full object-cover" sizes="900px" alt="" />
          ) : (
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" width={480} height={360} />
          )}
          <span className="absolute inset-0 bg-ink/30" />
          <span className="relative grid size-20 place-items-center rounded-full bg-brand text-white shadow-2xl transition group-hover:scale-110">
            <Icon name="play" className="ml-1 size-8 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
