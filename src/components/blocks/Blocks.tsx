import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { Html } from "@/components/ui/basics";
import { BlogCard, ServiceCard, TestimonialCard } from "@/components/ui/cards";
import { MobileCardCarousel } from "@/components/ui/MobileCardCarousel";
import { CountUp } from "@/components/ui/interactive";
import { Cta, EnquirySection, FaqSection } from "@/components/ui/sections";
import type { Block, CaseStudyCard, Item } from "@/lib/types";
import { cn, highlight, itemTitle, pad2, youtubeId } from "@/lib/utils";
import { VideoFacade } from "./VideoFacade";

/*
 * Page-builder blocks (port of components/blocks.blade.php + resources/views/blocks/*).
 * Laravel's BlockPresenter already resolved media and any database lookups into block.media / block.extra.
 */

const CENTERED_TYPES = ["service_cards", "feature_cards", "statistics", "process", "testimonials", "pricing", "logo_cloud", "industries", "technologies", "case_studies", "related_services", "related_blogs", "related_locations", "gallery", "timeline", "benefits"];

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockSection key={i} block={block} />
      ))}
    </>
  );
}

function BlockSection({ block }: { block: Block }) {
  const d = block.data;
  const { dark, center } = block;

  // These render their own section.
  if (block.type === "cta") {
    const variant = ({ brand: "brand", mist: "light", white: "light" } as const)[d.background as "brand" | "mist" | "white"] ?? "dark";
    return <Cta heading={d.heading} text={d.subheading ?? d.content} buttonText={d.cta_text ?? "Get a Free Consultation"} buttonUrl={d.cta_url} variant={variant} />;
  }
  if (block.type === "contact_form") {
    return <EnquirySection heading={d.heading} text={d.subheading} eyebrow={d.eyebrow ?? "Let’s talk"} service={block.extra.service} location={block.extra.location} formName="block-form" />;
  }
  if (block.type === "faq") {
    return <FaqSection faqs={block.extra.faqs ?? []} title={d.heading ?? "Frequently asked questions"} subtitle={d.subheading} />;
  }

  const Body = BODIES[block.type];
  if (!Body) return null;
  const wrap = ({ mist: "bg-mist", dark: "section-dark noise", brand: "bg-gradient-to-br from-teal-50 to-brand-50" } as Record<string, string>)[block.background] ?? "bg-white";
  const anchor = d.anchor ? String(d.anchor).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : undefined;

  return (
    <section className={cn("section relative overflow-hidden", wrap)} id={anchor}>
      {dark && (
        <>
          <div className="bg-grid pointer-events-none absolute inset-0 -z-10" />
          <div className="mesh">
            <span className="-right-40 -top-40 size-[30rem] bg-teal/25" />
            <span className="-bottom-40 -left-32 size-[26rem] bg-amber/15 [animation-delay:-9s]" />
          </div>
        </>
      )}
      <div className="container-x relative">
        {d.heading && !["hero", "image_text"].includes(block.type) && (
          <div className={cn(center || CENTERED_TYPES.includes(block.type) ? "mx-auto max-w-3xl text-center" : "max-w-3xl max-sm:mx-auto max-sm:text-center", "mb-8")} data-reveal="">
            {d.eyebrow && <p className={cn("eyebrow", dark && "eyebrow-dark")}>{d.eyebrow}</p>}
            <h2 className={cn("h-section mt-2.5", dark && "text-white")}>{highlight(d.heading)}</h2>
            {d.subheading && <p className={cn("mt-3 text-lg", dark ? "text-white/65" : "text-ink-500")}>{d.subheading}</p>}
          </div>
        )}
        <Body block={block} />
      </div>
    </section>
  );
}

const TONES3 = ["bg-brand-50 text-brand", "bg-teal-50 text-teal-700", "bg-amber-50 text-amber-600"];

/** Block bodies, also used directly by service / landing / case-study pages. */
export const BODIES: Record<string, (p: { block: Block }) => React.ReactNode> = {
  hero: ({ block: { data: d, media, dark, center } }) => {
    const img = media[d.image_id];
    return (
      <div className={cn("grid items-center gap-12", img && "lg:grid-cols-2", center && "text-center")}>
        <div className={cn(center ? "text-center" : "max-sm:text-center", center && !img && "mx-auto max-w-3xl")} data-reveal="">
          {d.eyebrow && <p className={cn("eyebrow", dark && "eyebrow-dark")}>{d.eyebrow}</p>}
          {d.heading && <h2 className={cn("h-display mt-4", dark && "text-white")}>{highlight(d.heading)}</h2>}
          {d.subheading && <p className={cn("mt-5 text-lg", dark ? "text-white/75" : "text-ink-600/80")}>{d.subheading}</p>}
          <Html html={d.content} className={cn("prose-content mt-4 max-sm:text-left", dark && "!text-white/80")} />
          {d.cta_text && (
            <div className={cn("mt-8 flex flex-wrap gap-3", center ? "justify-center" : "max-sm:justify-center")}>
              <Link href={d.cta_url ?? "/contact/"} className="btn btn-primary btn-lg" data-cta="block-hero">
                {d.cta_text} <Icon name="arrow-right" className="size-4" />
              </Link>
              {d.secondary_cta_text && (
                <Link href={d.secondary_cta_url ?? "#"} className={cn("btn btn-lg", dark ? "btn-ghost-dark" : "btn-secondary")}>
                  {d.secondary_cta_text}
                </Link>
              )}
            </div>
          )}
        </div>
        {img && (
          <div data-reveal="">
            <Img media={img} sizes="(min-width:1024px) 560px, 100vw" className="w-full rounded-3xl shadow-[var(--shadow-lift)]" />
          </div>
        )}
      </div>
    );
  },

  text: ({ block: { data: d, dark, center } }) => (
    <>
      <Html html={d.content} className={cn("prose-content", center ? "mx-auto max-w-3xl text-center" : "max-w-4xl", dark && "!text-white/80 [&_h2]:!text-white [&_h3]:!text-white [&_strong]:!text-white")} data-reveal="" />
      {d.cta_text && (
        <div className={cn("mt-8", center && "text-center")}>
          <Link href={d.cta_url ?? "/contact/"} className="btn btn-primary" data-cta="block-text">
            {d.cta_text} <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      )}
    </>
  ),

  image_text: ({ block: { data: d, media, dark } }) => {
    const img = media[d.image_id];
    const right = (d.image_position ?? "left") === "right";
    const points: unknown[] = (d.items ?? []).filter(Boolean);
    return (
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className={cn(right && "lg:order-2")} data-reveal="">
          {img ? (
            <div className="relative">
              <div className="absolute -inset-3 -z-0 rounded-[2rem] bg-gradient-to-br from-brand/20 via-amber/10 to-teal/20 blur-xl" />
              <Img media={img} sizes="(min-width:1024px) 560px, 100vw" className="relative aspect-[4/3] w-full rounded-[1.75rem] object-cover" />
            </div>
          ) : (
            <div className="grid aspect-[4/3] grid-cols-2 gap-3" aria-hidden="true">
              <div className="rounded-3xl bg-teal" />
              <div className="rounded-3xl bg-brand" />
              <div className="rounded-3xl bg-amber" />
              <div className="rounded-3xl bg-steel" />
            </div>
          )}
        </div>
        <div className="max-sm:text-center" data-reveal="">
          {d.eyebrow && <p className={cn("eyebrow", dark && "eyebrow-dark")}>{d.eyebrow}</p>}
          {d.heading && <h2 className={cn("h-section mt-4", dark && "text-white")}>{highlight(d.heading)}</h2>}
          {d.subheading && <p className={cn("mt-3 text-lg font-medium", dark ? "text-amber" : "text-ink")}>{d.subheading}</p>}
          <Html html={d.content} className={cn("prose-content mt-4 max-sm:text-left", dark && "!text-white/80")} />
          {points.length > 0 && (
            <ul className="mt-6 grid gap-3 text-left" role="list">
              {points.map((p, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white">
                    <Icon name="check" className="size-3.5" />
                  </span>
                  <span className={dark ? "text-white/85" : "text-ink-700"}>{itemTitle(p)}</span>
                </li>
              ))}
            </ul>
          )}
          {d.cta_text && (
            <Link href={d.cta_url ?? "/contact/"} className="btn btn-primary mt-8" data-cta="block-image-text">
              {d.cta_text} <Icon name="arrow-right" className="size-4" />
            </Link>
          )}
        </div>
      </div>
    );
  },

  two_column: ({ block: { data: d, dark } }) => (
    <div className="grid gap-10 md:grid-cols-2">
      {((d.items ?? []) as Item[]).slice(0, 2).map((col, i) => (
        <div key={i} className={cn("prose-content", dark && "!text-white/80 [&_h3]:!text-white")} data-reveal="stagger">
          {col.title && <h3 className="!mt-0">{col.title}</h3>}
          <div dangerouslySetInnerHTML={{ __html: col.text ?? "" }} />
        </div>
      ))}
    </div>
  ),

  three_column: ({ block: { data: d, dark } }) => (
    <div className="grid gap-8 md:grid-cols-3">
      {((d.items ?? []) as Item[]).slice(0, 3).map((col, i) => (
        <div key={i} className={dark ? "rounded-2xl border border-white/10 bg-white/5 p-6" : "card"} data-reveal="stagger">
          {col.icon && (
            <span className={cn("icon-tile mb-4", TONES3[i % 3])}>
              <Icon name={col.icon} className="size-6" />
            </span>
          )}
          {col.title && <h3 className={cn("text-lg font-bold", dark && "text-white")}>{col.title}</h3>}
          <div className={cn("mt-2 text-[0.97rem] leading-relaxed", dark ? "text-white/75" : "text-ink-600/80")} dangerouslySetInnerHTML={{ __html: col.text ?? "" }} />
        </div>
      ))}
    </div>
  ),

  service_cards: ({ block }) => <ServiceGrid services={block.extra.services ?? []} />,
  related_services: ({ block }) => <ServiceGrid services={block.extra.services ?? []} />,

  feature_cards: ({ block: { data: d, dark } }) => {
    const items = (d.items ?? []) as Item[];
    const cols = items.length % 3 === 0 ? "lg:grid-cols-3" : "lg:grid-cols-4";
    return (
      <MobileCardCarousel dark={dark} gridClassName={cn("grid gap-5 sm:grid-cols-2", cols)}>
        {items.map((item, i) => (
          <div key={i} className={cn(dark ? "card-dark" : "card card-hover", "spotlight group max-sm:flex max-sm:flex-col max-sm:items-center max-sm:text-center")} data-reveal="stagger">
            <span className={cn("icon-tile", ["bg-brand-50 text-brand", "bg-teal-50 text-teal-700", "bg-amber-50 text-amber-600", "bg-mist text-ink"][i % 4])}>
              <Icon name={item.icon ?? "sparkles"} className="size-6" />
            </span>
            <h3 className={cn("mt-5 text-lg font-bold", dark && "text-white")}>{item.title}</h3>
            {item.text && <p className={cn("mt-2 text-[0.95rem] leading-relaxed", dark ? "text-white/70" : "text-ink-600/80")}>{item.text}</p>}
            {item.url && (
              <Link href={item.url} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Learn more <Icon name="arrow-right" className="size-4" />
              </Link>
            )}
          </div>
        ))}
      </MobileCardCarousel>
    );
  },

  benefits: ({ block: { data: d, dark } }) => (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {((d.items ?? []) as (Item | string)[]).map((item, i) => (
        <li key={i} className={cn("flex items-start gap-4 rounded-2xl p-5", dark ? "border border-white/10 bg-white/5" : "border border-line bg-white")} data-reveal="stagger">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-amber text-white">
            <Icon name={(typeof item === "object" && item.icon) || "check"} className="size-5" />
          </span>
          <div>
            <p className={cn("font-semibold", dark ? "text-white" : "text-ink")}>{itemTitle(item)}</p>
            {typeof item === "object" && item.text && <p className={cn("mt-1 text-sm", dark ? "text-white/70" : "text-ink-600/80")}>{item.text}</p>}
          </div>
        </li>
      ))}
    </ul>
  ),

  statistics: ({ block: { data: d, dark } }) => {
    const items = (d.items ?? []) as Item[];
    return (
      <dl className={cn("grid grid-cols-2 gap-4", items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {items.map((s, i) => (
          <div key={i} className={cn("rounded-2xl p-6 text-center sm:p-8", dark ? "border border-white/10 bg-white/5" : "border border-line bg-white shadow-[var(--shadow-card)]")} data-reveal="stagger">
            <dd className={cn("font-display text-5xl font-bold tracking-[-0.05em]", dark ? "text-white" : "text-ink")}>
              <CountUp value={s.value ?? 0} />
              <span className={["text-brand", "text-teal", "text-amber"][i % 3]}>{s.suffix ?? ""}</span>
            </dd>
            <dt className={cn("mt-2 text-sm", dark ? "text-white/60" : "text-steel")}>{s.title ?? s.label ?? ""}</dt>
          </div>
        ))}
      </dl>
    );
  },

  process: ({ block: { data: d, dark } }) => (
    <MobileCardCarousel as="ol" dark={dark} gridClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {((d.items ?? []) as Item[]).map((step, i) => (
        <li key={i} className={cn("spotlight rounded-2xl p-6 max-sm:text-center", dark ? "border border-white/10 bg-white/5" : "border border-line bg-white")} data-reveal="stagger">
          <span className={cn("font-display text-5xl font-extrabold", ["text-brand/20", "text-teal/25", "text-amber/30", "text-steel/25"][i % 4])}>{pad2(i + 1)}</span>
          <h3 className={cn("mt-2 text-lg font-bold", dark && "text-white")}>{step.title}</h3>
          <p className={cn("mt-2 text-[0.95rem]", dark ? "text-white/70" : "text-ink-600/80")}>{step.text}</p>
        </li>
      ))}
    </MobileCardCarousel>
  ),

  timeline: ({ block: { data: d, dark } }) => (
    <ol className={cn("relative mx-auto max-w-3xl border-l-2 border-dashed pl-8", dark ? "border-white/20" : "border-line")} role="list">
      {((d.items ?? []) as Item[]).map((item, i) => (
        <li key={i} className="relative pb-10 last:pb-0" data-reveal="stagger">
          <span className={cn("absolute -left-[2.6rem] top-0 grid size-8 place-items-center rounded-full text-xs font-bold text-white ring-4", ["bg-brand", "bg-teal", "bg-amber"][i % 3], dark ? "ring-night" : "ring-white")}>{i + 1}</span>
          {item.value && <p className="text-sm font-bold uppercase tracking-wider text-brand">{item.value}</p>}
          <h3 className={cn("mt-1 text-lg font-bold", dark && "text-white")}>{item.title}</h3>
          <p className={cn("mt-1", dark ? "text-white/70" : "text-ink-600/80")}>{item.text}</p>
        </li>
      ))}
    </ol>
  ),

  testimonials: ({ block }) => (
    <MobileCardCarousel dark={block.dark} gridClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {(block.extra.testimonials ?? []).map((t: never, i: number) => (
        <TestimonialCard key={i} testimonial={t} />
      ))}
    </MobileCardCarousel>
  ),

  case_studies: ({ block }) => <CaseStudyBlockCards studies={block.extra.studies ?? []} />,

  industries: ({ block }) => <IndustryGrid industries={block.extra.industries ?? []} dark={block.dark} />,

  technologies: ({ block: { data: d, media, dark } }) => (
    <ul className="flex flex-wrap justify-center gap-3" role="list">
      {((d.items ?? []) as Item[]).map((t, i) => {
        const logo = media[t.image_id];
        const href = typeof t.url === "string" && t.url.trim() ? t.url.trim() : null;
        const inner = (
          <>
            {logo ? (
              <Img media={logo} className="size-6 object-contain" sizes="24px" alt={t.title ?? ""} />
            ) : t.icon ? (
              <Icon name={t.icon} className="size-5 text-brand" />
            ) : (
              <span className={cn("size-2.5 rounded-sm", ["bg-brand", "bg-teal", "bg-amber", "bg-steel"][i % 4])} />
            )}
            <span>{t.title ?? t.name ?? ""}</span>
          </>
        );
        return (
          <li
            key={i}
            className={cn(
              "rounded-2xl font-semibold",
              dark ? "border border-white/10 bg-white/5 text-white" : "border border-line bg-white text-ink shadow-[var(--shadow-card)]"
            )}
            data-reveal="stagger"
          >
            {href ? (
              <Link href={href} className="flex items-center gap-2.5 px-5 py-3 transition hover:text-brand">
                {inner}
              </Link>
            ) : (
              <div className="flex items-center gap-2.5 px-5 py-3">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  ),

  pricing: ({ block: { data: d } }) => {
    const plans = (d.items ?? []) as Item[];
    return (
      <div className={cn("grid items-stretch gap-6 md:grid-cols-2", ["lg:grid-cols-1", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3"][Math.min(3, Math.max(1, plans.length))])}>
        {plans.map((plan, i) => {
          const hot = Boolean(plan.featured);
          const features = String(plan.features ?? "").split(/\r?\n/).filter(Boolean);
          return (
            <div key={i} className={cn("relative flex flex-col rounded-[1.75rem] p-8", hot ? "border-2 border-brand bg-gradient-to-b from-brand-50 to-white shadow-[var(--shadow-lift)] lg:-my-4 lg:py-12" : "border border-line bg-white")} data-reveal="stagger">
              {hot && <span className="absolute -top-3 left-8 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">{plan.badge || "Most popular"}</span>}
              <h3 className={cn("text-xl font-bold", hot && "text-brand-700")}>{plan.title}</h3>
              {plan.text && <p className={cn("mt-2 text-sm", hot ? "text-ink-600" : "text-steel")}>{plan.text}</p>}
              <p className="mt-6 flex items-baseline gap-1">
                <span className={cn("font-display text-4xl font-extrabold", hot ? "text-brand" : "text-ink")}>{plan.value}</span>
                <span className={cn("text-sm", hot ? "text-ink-600" : "text-steel")}>{plan.suffix}</span>
              </p>
              <ul className="mt-6 grid flex-1 gap-3 text-sm" role="list">
                {features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <Icon name="check" className={cn("mt-0.5 size-4 shrink-0", hot ? "text-teal" : "text-brand")} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.url ?? "/contact/"} className={cn("btn mt-8 w-full", hot ? "btn-primary" : "btn-secondary")} data-cta={`pricing-${String(plan.title ?? "plan").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                {plan.cta_text ?? "Get started"}
              </Link>
            </div>
          );
        })}
      </div>
    );
  },

  logo_cloud: ({ block: { data: d, media } }) => (
    <ul className="grid grid-cols-2 items-center gap-8 sm:grid-cols-3 lg:grid-cols-6" role="list">
      {((d.items ?? []) as Item[]).map((item, i) => {
        const logo = media[item.image_id];
        const rawUrl = typeof item.url === "string" ? item.url.trim() : "";
        const href = /^https?:\/\/|^\//i.test(rawUrl) ? rawUrl : "";
        const isExternal = /^https?:\/\//i.test(href);
        const content = logo ? (
          <Img
            media={logo}
            alt={item.title ?? ""}
            sizes="160px"
            className="h-10 w-auto transition-transform duration-300 hover:scale-110"
          />
        ) : (
          <span className="font-display text-lg font-bold text-steel/70 transition hover:text-brand">{item.title}</span>
        );
        return (
          <li key={i} className="flex justify-center">
            {href ? (
              isExternal ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center transition-transform duration-300 hover:scale-110" aria-label={item.title || "Partner"}>
                  {content}
                </a>
              ) : (
                <Link href={href} className="inline-flex items-center justify-center transition-transform duration-300 hover:scale-110" aria-label={item.title || "Partner"}>
                  {content}
                </Link>
              )
            ) : (
              content
            )}
          </li>
        );
      })}
    </ul>
  ),

  video: ({ block: { data: d, media } }) => {
    const url = String(d.video_url ?? "");
    const yt = youtubeId(url);
    const poster = media[d.image_id];
    if (yt) return <VideoFacade id={yt} title={d.heading ?? "Video"} poster={poster} />;
    if (!url) return null;
    return (
      <video className="mx-auto w-full max-w-4xl rounded-3xl" controls preload="none" poster={poster?.url}>
        <source src={url} />
      </video>
    );
  },

  gallery: ({ block: { data: d, media } }) => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {((d.gallery_ids ?? []) as number[]).map((id) => {
        const img = media[id];
        if (!img) return null;
        return (
          <figure key={id} className="group overflow-hidden rounded-2xl" data-reveal="stagger">
            <Img media={img} sizes="(min-width:768px) 33vw, 50vw" className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105" />
            {img.caption && <figcaption className="mt-2 text-sm text-steel">{img.caption}</figcaption>}
          </figure>
        );
      })}
    </div>
  ),

  comparison_table: ({ block: { extra, dark } }) => {
    const head: string[] = extra.head ?? [];
    const rows: string[][] = extra.rows ?? [];
    if (!head.length) return null;
    const yes = ["yes", "✓", "true"];
    const no = ["no", "✗", "false"];
    return (
      <div className={cn("overflow-x-auto rounded-2xl border", dark ? "border-white/10" : "border-line bg-white shadow-[var(--shadow-card)]")} data-reveal="">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className={dark ? "bg-white/5 text-white" : "bg-mist text-ink"}>
              {head.map((h, i) => (
                <th key={i} scope="col" className={cn("px-5 py-4 font-semibold", i === 1 && "text-brand")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={cn("border-t", dark ? "border-white/10 text-white/80" : "border-line")}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className={cn("px-5 py-4 font-medium", dark ? "text-white" : "text-ink")}>
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className="px-5 py-4">
                      {yes.includes(cell.toLowerCase()) ? <Icon name="check-circle" className="size-5 text-teal" label="Yes" /> : no.includes(cell.toLowerCase()) ? <Icon name="x" className="size-5 text-steel/50" label="No" /> : cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },

  // Only users with the "use custom html" permission can save this block (enforced in Laravel).
  custom_html: ({ block: { data: d, center } }) => <Html html={d.html} className={cn(center && "text-center")} />,

  related_blogs: ({ block }) =>
    block.extra.posts?.length ? (
      <MobileCardCarousel dark={block.dark} gridClassName="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {block.extra.posts.map((post: never, i: number) => (
          <BlogCard key={i} post={post} />
        ))}
      </MobileCardCarousel>
    ) : null,

  related_locations: ({ block: { extra, dark } }) =>
    extra.pages?.length ? (
      <ul className="flex flex-wrap justify-center gap-3" role="list">
        {(extra.pages as { name: string; url: string }[]).map((p) => (
          <li key={p.url}>
            <Link href={p.url} className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition", dark ? "border-white/15 bg-white/5 text-white hover:bg-white/10" : "border-line bg-white text-ink hover:border-brand hover:text-brand")}>
              <Icon name="map-pin" className="size-4 text-brand" /> {p.name}
            </Link>
          </li>
        ))}
      </ul>
    ) : null,
};

function ServiceGrid({ services }: { services: { name: string; url: string; description: string | null; icon: string | null }[] }) {
  return (
    <MobileCardCarousel gridClassName="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((s, i) => (
        <ServiceCard key={s.url} service={s} index={i} />
      ))}
    </MobileCardCarousel>
  );
}

/** blocks/case_studies.blade.php */
export function CaseStudyBlockCards({ studies }: { studies: CaseStudyCard[] }) {
  return (
    <MobileCardCarousel gridClassName="grid gap-6 md:grid-cols-3">
      {studies.map((study) => (
        <Link key={study.url} href={study.url} className="card card-hover group flex flex-col" data-reveal="stagger">
          {study.featured_image && (
            <div className="-mx-6 -mt-6 mb-5 aspect-[16/10] overflow-hidden rounded-t-[var(--radius-card)]">
              <Img media={study.featured_image} sizes="400px" className="size-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
          )}
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">{study.industry?.name}</p>
          <h3 className="mt-1 text-lg font-bold">{study.title}</h3>
          {study.metrics.length > 0 && (
            <div className="mt-auto flex gap-6 pt-5">
              {study.metrics.slice(0, 2).map((m, i) => (
                <div key={i}>
                  <p className="font-display text-2xl font-extrabold text-ink">{m.value}</p>
                  <p className="text-xs text-steel">{m.label}</p>
                </div>
              ))}
            </div>
          )}
        </Link>
      ))}
    </MobileCardCarousel>
  );
}

/** blocks/industries.blade.php */
export function IndustryGrid({ industries, dark = false }: { industries: { id: number; name: string; icon: string | null; url?: string | null }[]; dark?: boolean }) {
  const card = cn("flex h-full flex-col items-start gap-3 rounded-2xl p-5 transition", dark ? "border border-white/10 bg-white/5 hover:bg-white/10" : "border border-line bg-white hover:border-brand/40 hover:shadow-[var(--shadow-card)]");
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" role="list">
      {industries.map((industry, i) => {
        const inner = (
          <>
            <span className={cn("icon-tile size-11", TONES3[i % 3])}>
              <Icon name={industry.icon || "building"} className="size-5" />
            </span>
            <span className={cn("font-semibold", dark ? "text-white" : "text-ink")}>{industry.name}</span>
          </>
        );
        return (
          <li key={industry.id} data-reveal="stagger">
            {industry.url ? (
              <Link href={industry.url} className={card}>
                {inner}
              </Link>
            ) : (
              <div className={card}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Wrap plain item arrays (service features, landing benefits…) as a block so pages can reuse block bodies. */
export function asBlock(type: string, items: unknown[], dark = false): Block {
  return { type, data: { items }, background: dark ? "dark" : "white", dark, center: true, media: {}, extra: {} };
}

export function BlockBody({ block }: { block: Block }) {
  const Body = BODIES[block.type];
  return Body ? <Body block={block} /> : null;
}
