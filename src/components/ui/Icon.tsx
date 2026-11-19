import { ICONS } from "@/lib/icons.generated";

/** <x-icon>: inline stroke SVG from the shared icon set (unknown names fall back to "sparkles"). */
export function Icon({ name, className = "size-5", label }: { name?: string | null; className?: string; label?: string }) {
  const paths = ICONS[name ?? ""] ?? ICONS.sparkles;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      className={className}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      dangerouslySetInnerHTML={{ __html: paths }}
    />
  );
}
