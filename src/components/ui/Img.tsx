// Plain <picture>/<img> instead of next/image: Laravel's MediaService already generates AVIF/WebP + responsive variants.
import type { Media } from "@/lib/types";

type Props = {
  media: Media | null | undefined;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  lazy?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

/** <x-img>: responsive <picture> with the AVIF/WebP variants Laravel's MediaService produced. */
export function Img({ media, alt, sizes = "100vw", priority = false, lazy = true, className, style }: Props) {
  if (!media) return null;
  const webpSet = media.srcset
    ? media.srcset + (media.webp ? `, ${media.webp} ${media.width || 1920}w` : "")
    : media.webp;

  return (
    <picture>
      {media.avif && <source type="image/avif" srcSet={media.avif} />}
      {webpSet && <source type="image/webp" srcSet={webpSet} sizes={media.srcset ? sizes : undefined} />}
      <img
        src={media.url}
        alt={alt ?? media.alt ?? ""}
        title={media.title ?? undefined}
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        loading={priority ? "eager" : lazy ? "lazy" : undefined}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={className}
        style={style}
      />
    </picture>
  );
}
