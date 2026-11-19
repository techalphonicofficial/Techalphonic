import Link from "next/link";
import type { BlogCard as Blog, ServiceCard as Service, Testimonial } from "@/lib/types";
import { formatDate, limit, pad2 } from "@/lib/utils";
import { Icon } from "./Icon";
import { Img } from "./Img";
import { QUOTE_PATH, Stars } from "./basics";

/** <x-service-card> */
export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <Link
      href={service.url}
      className="spotlight group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-lift)]"
      data-reveal="stagger"
    >
      <span className="flex items-start justify-between">
        <span className="icon-tile bg-mist text-ink-700 transition duration-300 group-hover:bg-night group-hover:text-teal-200 group-hover:shadow-[0_10px_22px_-10px_rgb(6_20_24/0.6)]">
          <Icon name={service.icon || "sparkles"} className="size-[22px]" />
        </span>
        <span className="font-display text-sm font-bold tabular-nums text-ink/20 transition group-hover:text-brand">{pad2(index + 1)}</span>
      </span>
      <h3 className="mt-7 text-[1.2rem] font-bold leading-snug tracking-[-0.03em]">{service.name}</h3>
      {service.description && <p className="mt-2.5 flex-1 text-[0.93rem] leading-relaxed text-ink-500">{limit(service.description, 120)}</p>}
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink transition group-hover:text-brand">
        Learn more
        <Icon name="arrow-right" className="size-4 -translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
    </Link>
  );
}

/** <x-blog-card> */
export function BlogCard({ post }: { post: Blog }) {
  return (
    <article className="spotlight group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[var(--shadow-lift)]" data-reveal="stagger">
      <Link href={post.url} className="relative m-2 block aspect-[16/10] overflow-hidden rounded-[1.1rem] bg-mist" tabIndex={-1} aria-hidden="true">
        {post.featured_image ? (
          <Img media={post.featured_image} sizes="(min-width:1024px) 380px, (min-width:640px) 50vw, 100vw" className="size-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="relative isolate grid size-full place-items-center overflow-hidden bg-night">
            <div className="bg-grid absolute inset-0" />
            <div className="mesh">
              <span className="-left-10 -top-10 size-48 bg-teal/35" />
              <span className="-bottom-10 -right-10 size-48 bg-amber/20" />
            </div>
            <p className="relative px-6 text-center font-display text-xl font-bold leading-snug tracking-[-0.03em] text-white">{limit(post.title, 60)}</p>
          </div>
        )}
        {post.category && <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-ink shadow-sm backdrop-blur">{post.category.name}</span>}
      </Link>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
        <div className="flex items-center gap-2.5 text-xs text-ink-500">
          <time dateTime={post.published_at?.slice(0, 10)}>{formatDate(post.published_at)}</time>
          <span className="divider-dot" />
          <span>{post.reading_time} min read</span>
        </div>
        <h3 className="mt-3 text-[1.2rem] font-bold leading-snug tracking-[-0.03em]">
          <Link href={post.url} className="after:absolute after:inset-0 group-hover:text-brand">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2.5 line-clamp-2 text-[0.92rem] leading-relaxed text-ink-500">{post.excerpt}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-ink group-hover:text-brand">
          Read article <Icon name="arrow-right" className="size-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}

/** <x-testimonial> (light card) */
export function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <figure className="relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-7 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]" data-reveal="stagger">
      <svg className="absolute right-7 top-7 size-10 text-brand/10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={QUOTE_PATH} />
      </svg>
      <div className="flex gap-0.5 text-amber" aria-label={`${t.rating} out of 5 stars`}>
        <Stars rating={t.rating} />
      </div>
      <blockquote className="mt-5 flex-1 text-[1rem] leading-relaxed text-ink-700">“{t.review}”</blockquote>
      <figcaption className="mt-7 flex items-center gap-3.5 border-t border-line pt-6">
        {t.photo ? (
          <Img media={t.photo} className="size-11 rounded-full object-cover" sizes="44px" />
        ) : (
          <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-teal to-brand text-sm font-bold text-white">{t.initials}</span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{t.name}</p>
          <p className="truncate text-xs text-ink-500">{[t.designation, t.company].filter(Boolean).join(" · ")}</p>
        </div>
      </figcaption>
    </figure>
  );
}
