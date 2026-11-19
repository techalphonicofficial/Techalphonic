import { Fragment, type ReactNode } from "react";

/** Join class names, skipping falsy values (Blade's @class equivalent). */
export function cn(...parts: (string | number | false | null | undefined)[]): string {
  return parts.filter((p) => typeof p === "string" && p).join(" ");
}

/** "[[keyword]]" in admin headings → gradient span (App\Support\Highlight::render). Escapes everything else. */
export function highlight(text: string | null | undefined, className = "text-gradient"): ReactNode {
  if (!text) return null;
  return text.split(/(\[\[.+?\]\])/g).map((part, i) =>
    part.startsWith("[[") && part.endsWith("]]") ? (
      <span key={i} className={className}>
        {part.slice(2, -2)}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/** Highlight::strip */
export function stripHighlight(text: string | null | undefined): string {
  return (text ?? "").replace(/\[\[|\]\]/g, "");
}

/**
 * Word-by-word headline ([data-split]). Words are wrapped at render time (not by mutating the DOM after
 * hydration) so React keeps ownership of the markup. A highlighted keyword moves as one unit.
 */
export function splitWords(text: string | null | undefined, className = "text-gradient"): ReactNode {
  if (!text) return null;
  let i = 0;
  const word = (content: ReactNode, key: string) => (
    <span className="w" key={key}>
      <span style={{ "--i": i++ } as React.CSSProperties}>{content}</span>
    </span>
  );
  const out: ReactNode[] = [];
  text.split(/(\[\[.+?\]\])/g).forEach((part, p) => {
    if (!part) return;
    if (part.startsWith("[[") && part.endsWith("]]")) {
      out.push(word(<span className={className}>{part.slice(2, -2)}</span>, `h${p}`));
      return;
    }
    part.split(/(\s+)/).forEach((w, j) => {
      if (!w) return;
      out.push(w.trim() ? word(w, `${p}-${j}`) : <Fragment key={`${p}-${j}s`}>{w}</Fragment>);
    });
  });
  return out;
}

export function stripTags(html: string | null | undefined): string {
  return (html ?? "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function limit(text: string | null | undefined, max: number): string {
  const t = text ?? "";
  return t.length > max ? t.slice(0, max).trimEnd() + "..." : t;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function lines(text: string | null | undefined): string[] {
  return (text ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** PHP date formats used by the Blade views: "M j, Y" (short) and "F j, Y" (long). */
export function formatDate(iso: string | null | undefined, style: "short" | "long" = "short"): string {
  if (!iso) return "";
  const d = new Date(iso);
  const month = MONTHS[d.getUTCMonth()];
  return `${style === "short" ? month.slice(0, 3) : month} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function youtubeId(url: string | null | undefined): string | null {
  const m = (url ?? "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
}

/** Item helpers for repeater data that can be a plain string or {title, text}. */
export function itemTitle(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object" && "title" in item) return String((item as { title?: string }).title ?? "");
  return "";
}
