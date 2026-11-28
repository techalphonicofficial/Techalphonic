/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";
import type { Crumb, Settings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "./Icon";

/** <x-logo> */
export function Logo({ settings, dark = false, className }: { settings: Settings; dark?: boolean; className?: string }) {
  const logo = dark ? settings.logo_dark ?? settings.logo : settings.logo;
  const name = settings.site_name || "Tech Alphonic";
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center gap-2.5", className)} aria-label={`${name} — home`}>
      {logo ? (
        <>
          <img
            src={logo.webp || logo.url}
            alt={name}
            width={logo.width || 180}
            height={logo.height || 65}
            data-logo-img=""
            className={cn("h-9 w-auto sm:h-10", dark && !settings.logo_dark && "rounded-md bg-white px-2 py-1")}
            fetchPriority="high"
          />
          <span data-logo-fallback="" className={cn("hidden font-display text-lg font-extrabold leading-none whitespace-nowrap", dark ? "text-white" : "text-ink")}>
            {name}
          </span>
        </>
      ) : (
        <span className={cn("font-display text-lg font-extrabold leading-none whitespace-nowrap", dark ? "text-white" : "text-ink")}>{name}</span>
      )}
    </Link>
  );
}

export function BrandSquares({ className }: { className?: string }) {
  return (
    <span className={cn("brand-squares", className)} aria-hidden="true">
      <span className="bg-teal" />
      <span className="bg-brand" />
      <span className="bg-amber" />
      <span className="bg-steel" />
    </span>
  );
}

/** <x-breadcrumb> */
export function Breadcrumb({ items, dark = false, className }: { items: Crumb[]; dark?: boolean; className?: string }) {
  if (!items || items.length < 2) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm", dark ? "text-white/60" : "text-steel")} role="list">
        {items.map((crumb, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <Icon name="chevron-right" className="size-3.5 opacity-60" />}
              {crumb.url && !last ? (
                <Link href={crumb.url} className={cn("transition", dark ? "hover:text-white" : "hover:text-brand")}>
                  {crumb.name}
                </Link>
              ) : (
                <span aria-current="page" className={cn(dark ? "text-white" : "text-ink", "font-medium")}>
                  {crumb.name.length > 60 ? crumb.name.slice(0, 60) + "..." : crumb.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** <x-section-heading> */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  id,
  children,
}: {
  eyebrow?: string | null;
  title?: ReactNode;
  subtitle?: string | null;
  align?: "center" | "left";
  dark?: boolean;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl max-sm:mx-auto max-sm:text-center", "mb-6")} data-reveal="">
      {eyebrow && <p className={cn("eyebrow", dark && "eyebrow-dark", align === "center" ? "justify-center" : "max-sm:justify-center")}>{eyebrow}</p>}
      {title && (
        <h2 id={id} className={cn("h-section mt-2", dark && "text-white")}>
          {title}
        </h2>
      )}
      {subtitle && <p className={cn("mt-2.5 text-[1.02rem] leading-relaxed", dark ? "text-white/60" : "text-ink-500")}>{subtitle}</p>}
      {children}
    </div>
  );
}

/** Admin-authored rich HTML (already sanitised by Laravel on save). */
export function Html({ html, className, as: Tag = "div", ...rest }: { html: string | null | undefined; className?: string; as?: "div" | "article" } & Record<string, unknown>) {
  if (!html) return null;
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} {...rest} />;
}

export function Stars({ rating, className = "size-4" }: { rating: number; className?: string }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon key={s} name="star" className={cn(className, s <= rating ? "fill-current" : "opacity-25")} />
      ))}
    </>
  );
}

export const QUOTE_PATH =
  "M9.6 5C6 6.4 3.5 9.6 3.5 13.7c0 3 1.9 5.3 4.6 5.3 2.3 0 4-1.7 4-3.9s-1.6-3.8-3.7-3.8c-.4 0-.8.1-1 .1.4-2 2.2-3.9 4.1-4.8L9.6 5Zm10 0c-3.6 1.4-6.1 4.6-6.1 8.7 0 3 1.9 5.3 4.6 5.3 2.3 0 4-1.7 4-3.9s-1.6-3.8-3.7-3.8c-.4 0-.8.1-1 .1.4-2 2.2-3.9 4.1-4.8L19.6 5Z";
