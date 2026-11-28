import Link from "next/link";
import { asBlock, BlockBody } from "@/components/blocks/Blocks";
import { Icon } from "@/components/ui/Icon";
import { Img } from "@/components/ui/Img";
import { BrandSquares, Breadcrumb, Html, SectionHeading } from "@/components/ui/basics";
import { BlogCard, ServiceCard, TestimonialCard } from "@/components/ui/cards";
import { TabButton, TabFilter, TabGroup } from "@/components/ui/interactive";
import { Cta, FaqSection, PageHero, Pagination, RelatedLinks } from "@/components/ui/sections";
import { getLayout } from "@/lib/api";
import type { BlogData, BlogIndexData, CaseStudyCard, CaseStudyData, Industry, PortfolioCard, PortfolioData, SearchResult, Seo } from "@/lib/types";
import { cn, formatDate, limit, stripTags } from "@/lib/utils";
import { Toc } from "./Toc";

/* Blog, portfolio, case study, industries, search and error pages (port of resources/views/frontend/*). */

const p = (text: string | null | undefined) => (text ? `<p>${text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)}</p>` : null);

// ---------------------------------------------------------------- blog

export function BlogIndex({ data, seo }: { data: BlogIndexData; seo: Seo }) {
  return (
    <>
      <PageHero
        title={data.heading}
        eyebrow="Blog"
        intro={p(data.intro)}
        breadcrumbs={seo.breadcrumbs}
        layout="minimal"
        actions={
          <form action="/search/" method="get" role="search" className="flex w-full max-w-md gap-2">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <input id="blog-search" type="search" name="q" placeholder="Search articles…" className="form-input" />
            <button className="btn btn-primary" type="submit" aria-label="Search">
              <Icon name="search" className="size-4" />
            </button>
          </form>
        }
      />

      <section className="section">
        <div className="container-x">
          {data.categories.length > 0 && (
            <nav className="mb-10 flex flex-wrap gap-2" aria-label="Blog categories">
              <Link href={data.blog_url} className={cn("chip !px-4 !py-2 text-sm", !data.active_category ? "!border-brand !bg-brand !text-white" : "hover:border-ink/40")}>
                All
              </Link>
              {data.categories.map((cat) => (
                <Link key={cat.id} href={cat.url} className={cn("chip !px-4 !py-2 text-sm", data.active_category === cat.id ? "!border-brand !bg-brand !text-white" : "hover:border-ink/40")}>
                  {cat.name} <span className="ml-1 opacity-60">{cat.count}</span>
                </Link>
              ))}
            </nav>
          )}

          {data.posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-line p-16 text-center">
              <p className="font-display text-xl font-bold">No articles yet</p>
              <p className="mt-2 text-steel">Check back soon — we publish new guides regularly.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.posts.map((post) => (
                  <BlogCard key={post.url} post={post} />
                ))}
              </div>
              <Pagination p={data.pagination} />
            </>
          )}
        </div>
      </section>

      <Cta variant="light" />
    </>
  );
}

export function BlogPost({ data, seo }: { data: BlogData; seo: Seo }) {
  const b = data.blog;
  const related = data.related.find((g) => g.title === "Related services");
  const updated = b.updated_at && b.published_at && new Date(b.updated_at).getTime() > new Date(b.published_at).getTime() + 86_400_000;

  return (
    <>
      {b.featured_image && <link rel="preload" as="image" href={b.featured_image.webp || b.featured_image.url} fetchPriority="high" />}
      <article>
        <header className="relative overflow-hidden bg-mist">
          <div className="bg-grid-light absolute inset-0" />
          <div className="container-x relative py-7 sm:py-9">
            <Breadcrumb items={seo.breadcrumbs} className="mb-4" />
            <div className="mx-auto max-w-3xl text-center">
              {b.category && (
                <Link href={b.category.url} className="eyebrow">
                  {b.category.name}
                </Link>
              )}
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{b.title}</h1>
              {b.excerpt && <p className="lead mt-3">{b.excerpt}</p>}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-steel">
                {b.author && (
                  <span className="flex items-center gap-2">
                    {b.author.avatar ? (
                      <Img media={b.author.avatar} className="size-8 rounded-full object-cover" sizes="32px" />
                    ) : (
                      <span className="grid size-8 place-items-center rounded-full bg-brand text-xs font-bold text-white">{b.author.name.charAt(0)}</span>
                    )}
                    <span>{b.author.name}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Icon name="clock" className="size-4" /> {b.reading_time} min read
                </span>
                <time dateTime={b.published_at ?? undefined}>{formatDate(b.published_at, "long")}</time>
                {updated && (
                  <span>
                    Updated <time dateTime={b.updated_at!}>{formatDate(b.updated_at)}</time>
                  </span>
                )}
              </div>
            </div>
            {b.featured_image && (
              <div className="mx-auto mt-6 max-w-5xl">
                <Img media={b.featured_image} priority sizes="(min-width:1024px) 1024px, 100vw" className="aspect-[16/8] w-full rounded-[2rem] object-cover shadow-[var(--shadow-lift)]" />
              </div>
            )}
          </div>
        </header>

        <div className="container-x section grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <aside className="hidden lg:block" aria-label="Table of contents">
            {b.toc.length > 0 && <Toc items={b.toc} />}
          </aside>

          <div className="min-w-0">
            {b.toc.length > 0 && (
              <details className="mb-8 rounded-2xl border border-line bg-mist p-5 lg:hidden">
                <summary className="cursor-pointer font-semibold text-ink">Table of contents</summary>
                <ol className="mt-3 grid gap-2 text-sm" role="list">
                  {b.toc.map((item) => (
                    <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
                      <a href={`#${item.id}`} className="text-ink-600 hover:text-brand">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <Html html={b.html} className="prose-content" />

            {b.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
                {b.tags.map((tag) => (
                  <Link key={tag.url} href={tag.url} className="chip hover:border-brand hover:text-brand">
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {b.author?.bio && (
              <div className="mt-10 flex gap-5 rounded-3xl border border-line p-6">
                {b.author.avatar && <Img media={b.author.avatar} className="size-16 shrink-0 rounded-2xl object-cover" sizes="64px" />}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-steel">Written by</p>
                  <p className="mt-1 font-display text-lg font-bold text-ink">{b.author.name}</p>
                  {b.author.designation && <p className="text-sm text-brand">{b.author.designation}</p>}
                  <p className="mt-2 text-sm text-ink-600">{b.author.bio}</p>
                </div>
              </div>
            )}
          </div>

          <aside className="grid content-start gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-amber-50/60 p-6">
              <BrandSquares />
              <p className="mt-4 font-display text-lg font-bold">Need help putting this into practice?</p>
              <p className="mt-2 text-sm text-ink-600">Get a free consultation with our specialists.</p>
              <Link href={data.contact_url} className="btn btn-primary mt-5 w-full" data-cta="blog-sidebar">
                Talk to an expert
              </Link>
            </div>
            {related && related.links.length > 0 && (
              <nav className="rounded-3xl border border-line bg-white p-6 shadow-xs" aria-label="Related services">
                <div className="flex items-center justify-between gap-2 border-b border-line/70 pb-3.5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Related services</p>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[0.7rem] font-bold text-brand">{related.links.length}</span>
                </div>
                <ul className="mt-3.5 grid gap-1.5" role="list">
                  {related.links.map((link) => (
                    <li key={link.url}>
                      <Link
                        href={link.url}
                        className="group flex items-center justify-between gap-2.5 rounded-xl border border-transparent bg-mist/40 px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-brand/30 hover:bg-white hover:text-brand hover:shadow-2xs"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                            <Icon name={link.icon || "sparkles"} className="size-3.5" />
                          </span>
                          <span className="truncate">{link.name}</span>
                        </span>
                        <Icon name="arrow-up-right" className="size-4 shrink-0 text-steel transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </article>

      {b.faq_enabled && <FaqSection faqs={data.faqs} />}

      {data.blogs.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Keep reading" title="Related articles" />
            <div className="grid gap-6 md:grid-cols-3">
              {data.blogs.map((post) => (
                <BlogCard key={post.url} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      <RelatedLinks groups={data.related} />
      <Cta />
    </>
  );
}

// ---------------------------------------------------------------- portfolio

export function PortfolioIndex({ data, seo }: { data: { items: PortfolioCard[]; categories: string[] }; seo: Seo }) {
  return (
    <>
      <PageHero title="Our Work" eyebrow="Portfolio" intro="<p>Websites, apps and campaigns built to perform — a selection of recent projects.</p>" breadcrumbs={seo.breadcrumbs} layout="centered" actions={false} />
      <section className="section">
        <TabGroup initial="all">
          <div className="container-x">
            {data.categories.length > 1 && (
              <div className="mb-10 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter projects">
                {["all", ...data.categories].map((cat) => (
                  <TabButton key={cat} id={cat} className="rounded-full border px-4 py-2 text-sm font-semibold transition" activeClass="border-brand bg-brand text-white" inactiveClass="border-line hover:border-ink/40">
                    {cat === "all" ? "All" : cat}
                  </TabButton>
                ))}
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.length ? (
                data.items.map((item) => (
                  <TabFilter key={item.url} match={item.category ?? ""}>
                    <Link href={item.url} className="group relative block overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                      <div className="aspect-[4/3] overflow-hidden bg-mist">{item.featured_image && <Img media={item.featured_image} sizes="(min-width:1024px) 400px, 50vw" className="size-full object-cover transition duration-700 group-hover:scale-105" />}</div>
                      <div className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand">{item.category}</p>
                        <h2 className="mt-1 text-lg font-bold">{item.title}</h2>
                        {item.summary && <p className="mt-2 line-clamp-2 text-sm text-ink-600/80">{item.summary}</p>}
                      </div>
                    </Link>
                  </TabFilter>
                ))
              ) : (
                <p className="col-span-full text-center text-steel">Projects coming soon.</p>
              )}
            </div>
          </div>
        </TabGroup>
      </section>
      <Cta />
    </>
  );
}

export function PortfolioShow({ data, seo }: { data: PortfolioData; seo: Seo }) {
  const item = data.item;
  return (
    <>
      <PageHero
        title={item.title}
        eyebrow={item.category}
        intro={p(item.summary)}
        breadcrumbs={seo.breadcrumbs}
        image={item.featured_image}
        layout="split"
        actions={
          <>
            {item.project_url && (
              <a href={item.project_url} target="_blank" rel="noopener nofollow" className="btn btn-secondary btn-lg">
                Visit live site <Icon name="arrow-up-right" className="size-4" />
              </a>
            )}
            <Link href={data.contact_url} className="btn btn-primary btn-lg" data-cta="portfolio-similar">
              Build something similar
            </Link>
          </>
        }
      />
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_320px]">
          <article className="prose-content">
            {item.description && <div dangerouslySetInnerHTML={{ __html: item.description }} />}
            {item.results && (
              <>
                <h2>Results</h2>
                <p>{item.results}</p>
              </>
            )}
          </article>
          <aside className="grid content-start gap-4 rounded-3xl border border-line p-6 lg:sticky lg:top-28">
            {item.client && (
              <div>
                <p className="text-xs uppercase tracking-wider text-steel">Client</p>
                <p className="font-semibold text-ink">{item.client}</p>
              </div>
            )}
            {item.industry && (
              <div>
                <p className="text-xs uppercase tracking-wider text-steel">Industry</p>
                <p className="font-semibold text-ink">{item.industry.name}</p>
              </div>
            )}
            {item.service && (
              <div>
                <p className="text-xs uppercase tracking-wider text-steel">Service</p>
                <Link href={item.service.url} className="font-semibold text-brand">
                  {item.service.name}
                </Link>
              </div>
            )}
            {item.technologies.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-steel">Technology</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.technologies.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
      {item.gallery.length > 0 && (
        <section className="section-sm bg-mist">
          <div className="container-x grid gap-4 sm:grid-cols-2">
            {item.gallery.map((img) => (
              <Img key={img.id} media={img} sizes="(min-width:640px) 50vw, 100vw" className="w-full rounded-2xl" />
            ))}
          </div>
        </section>
      )}
      <RelatedLinks groups={data.related} />
      <Cta />
    </>
  );
}

// ---------------------------------------------------------------- case studies

export function CaseStudyIndex({ data, seo }: { data: { studies: CaseStudyCard[] }; seo: Seo }) {
  return (
    <>
      <PageHero title="Case Studies" eyebrow="Results" intro="<p>How we helped businesses grow traffic, leads and revenue — with the numbers to prove it.</p>" breadcrumbs={seo.breadcrumbs} layout="centered" actions={false} />
      <section className="section">
        <div className="container-x grid gap-8">
          {data.studies.length ? (
            data.studies.map((study, i) => (
              <Link key={study.url} href={study.url} className="group grid overflow-hidden rounded-[2rem] border border-line bg-white transition hover:shadow-[var(--shadow-lift)] lg:grid-cols-2">
                <div className={cn("aspect-[16/10] overflow-hidden bg-mist", i % 2 && "lg:order-2")}>
                  {study.featured_image && <Img media={study.featured_image} sizes="(min-width:1024px) 600px, 100vw" className="size-full object-cover transition duration-700 group-hover:scale-105" />}
                </div>
                <div className="flex flex-col justify-center p-8 lg:p-12">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand">{[study.industry?.name, study.service?.name].filter(Boolean).join(" · ")}</p>
                  <h2 className="mt-2 text-2xl font-bold">{study.title}</h2>
                  {study.summary && <p className="mt-3 text-ink-600/80">{study.summary}</p>}
                  {study.metrics.length > 0 && (
                    <dl className="mt-6 flex flex-wrap gap-8">
                      {study.metrics.slice(0, 3).map((m, j) => (
                        <div key={j}>
                          <dd className="font-display text-3xl font-extrabold text-ink">{m.value}</dd>
                          <dt className="text-xs text-steel">{m.label}</dt>
                        </div>
                      ))}
                    </dl>
                  )}
                  <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-brand">
                    Read case study <Icon name="arrow-right" className="size-4" />
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-steel">Case studies coming soon.</p>
          )}
        </div>
      </section>
      <Cta />
    </>
  );
}

export function CaseStudyShow({ data, seo }: { data: CaseStudyData; seo: Seo }) {
  const study = data.study;
  const parts: [keyof typeof study, string, string, string][] = [
    ["challenge", "The challenge", "target", "bg-brand-50 text-brand"],
    ["solution", "Our solution", "zap", "bg-teal-50 text-teal-700"],
    ["results", "The results", "trending-up", "bg-amber-50 text-amber-600"],
  ];
  return (
    <>
      <PageHero
        title={study.title}
        eyebrow={[study.industry?.name, study.client].filter(Boolean).join(" · ")}
        intro={p(study.summary)}
        breadcrumbs={seo.breadcrumbs}
        image={study.featured_image}
        layout="split"
        actions={
          <Link href={data.contact_url} className="btn btn-primary btn-lg" data-cta="case-study-hero">
            Get similar results <Icon name="arrow-right" className="size-4" />
          </Link>
        }
      />

      {study.metrics.length > 0 && (
        <section className="section-sm">
          <div className="container-x">
            <BlockBody block={asBlock("statistics", study.metrics.map((m) => ({ value: m.value ?? "", title: m.label ?? "" })))} />
          </div>
        </section>
      )}

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          {parts.map(([field, label, icon, tone]) =>
            study[field] ? (
              <div key={field} data-reveal="stagger">
                <span className={cn("icon-tile", tone)}>
                  <Icon name={icon} className="size-6" />
                </span>
                <h2 className="mt-4 text-2xl font-bold">{label}</h2>
                <Html html={String(study[field])} className="prose-content mt-3" />
              </div>
            ) : null,
          )}
        </div>
      </section>

      {study.technologies.length > 0 && (
        <section className="section-sm bg-mist">
          <div className="container-x text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-steel">Technology used</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {study.technologies.map((t) => (
                <span key={t} className="chip !px-4 !py-2 text-sm">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {study.testimonial && (
        <section className="section">
          <div className="container-x max-w-3xl">
            <TestimonialCard testimonial={study.testimonial} />
          </div>
        </section>
      )}
      {study.gallery && study.gallery.length > 0 && (
        <section className="section-sm bg-mist">
          <div className="container-x grid gap-4 sm:grid-cols-2">
            {study.gallery.map((img) => (
              <Img key={img.id} media={img} sizes="(min-width:640px) 50vw, 100vw" className="w-full rounded-2xl" />
            ))}
          </div>
        </section>
      )}
      <RelatedLinks groups={data.related} />
      <Cta />
    </>
  );
}

// ---------------------------------------------------------------- industries

export function IndustriesPage({ data, seo }: { data: { industries: Industry[] }; seo: Seo }) {
  return (
    <>
      <PageHero title="Industries We Serve" eyebrow="Industries" intro="<p>Every industry buys differently. Our strategies are built around how your customers search, compare and decide.</p>" breadcrumbs={seo.breadcrumbs} layout="centered" />
      <section className="section">
        <div className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.industries.map((industry, i) => (
            <div key={industry.id} className="card flex flex-col" data-reveal="stagger">
              {industry.image ? (
                <div className="mb-5 aspect-[16/9] overflow-hidden rounded-xl bg-mist">
                  <Img media={industry.image} sizes="(min-width:1024px) 380px, 100vw" className="size-full object-cover" />
                </div>
              ) : (
                <span className={cn("icon-tile", ["bg-brand-50 text-brand", "bg-teal-50 text-teal-700", "bg-amber-50 text-amber-600"][i % 3])}>
                  <Icon name={industry.icon || "building"} className="size-6" />
                </span>
              )}
              <h2 className={cn("text-xl font-bold", !industry.image && "mt-5")}>{industry.name}</h2>
              {industry.description && <p className="mt-2 flex-1 text-[0.95rem] text-ink-600/80">{limit(stripTags(industry.description), 150)}</p>}
              {industry.pages && industry.pages.length > 0 && (
                <ul className="mt-5 grid gap-1 border-t border-line pt-4" role="list">
                  {industry.pages.map((pg) => (
                    <li key={pg.url}>
                      <Link href={pg.url} className="flex items-center justify-between rounded-lg py-1.5 text-sm font-medium text-ink hover:text-brand">
                        {pg.name} <Icon name="arrow-right" className="size-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
      <Cta />
    </>
  );
}

// ---------------------------------------------------------------- search

export function SearchForm({ q }: { q: string }) {
  return (
    <section className="bg-mist">
      <div className="container-x py-14 sm:py-20">
        <h1 className="h-section text-center">{q ? "Search results" : "Search"}</h1>
        <form action="/search/" method="get" role="search" className="mx-auto mt-8 flex max-w-2xl gap-2">
          <label htmlFor="q" className="sr-only">
            Search
          </label>
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-steel" />
            <input id="q" type="search" name="q" defaultValue={q} placeholder="Search services, locations, articles…" className="form-input !min-h-14 !pl-12 text-base" autoFocus />
          </div>
          <button type="submit" className="btn btn-primary btn-lg">
            Search
          </button>
        </form>
      </div>
    </section>
  );
}

export function SearchResults({ q, results }: { q: string; results: SearchResult[] }) {
  if (!q) return null;
  return (
    <>
      <p className="mb-6 text-sm text-steel">
        {results.length} result{results.length === 1 ? "" : "s"} for “<strong className="text-ink">{q}</strong>”
      </p>
      {results.length ? (
        results.map((r) => (
          <Link key={r.url} href={r.url} className="group mb-3 block rounded-2xl border border-line p-5 transition hover:border-brand/40 hover:shadow-[var(--shadow-card)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">{r.type}</span>
            <span className="mt-1 block text-lg font-semibold text-ink group-hover:text-brand">{r.title}</span>
            {r.excerpt && <span className="mt-1 block line-clamp-2 text-sm text-ink-600/80">{stripTags(r.excerpt)}</span>}
          </Link>
        ))
      ) : (
        <div className="rounded-3xl border border-dashed border-line p-12 text-center">
          <p className="font-display text-xl font-bold">No results found</p>
          <p className="mt-2 text-steel">
            Try a different keyword, or{" "}
            <Link href="/contact/" className="font-semibold text-brand">
              ask our team
            </Link>
            .
          </p>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------- errors (errors/partials/body)

export async function ErrorBody({ code, title, message, suggestions = false }: { code: number; title: string; message: string; suggestions?: boolean }) {
  const { popular_services } = suggestions ? await getLayout() : { popular_services: [] };
  return (
    <>
      <section className="relative isolate overflow-hidden bg-white">
        <div className="bg-grid-light absolute inset-0 -z-10" />
        <div className="mesh">
          <span className="-left-40 -top-40 size-[34rem] bg-amber/20" />
          <span className="-right-40 bottom-0 size-[30rem] bg-teal/25 [animation-delay:-9s]" />
        </div>
        <div className="container-x relative py-20 text-center sm:py-28">
          <BrandSquares className="mx-auto mb-8 scale-150" />
          <p className="text-gradient font-display text-8xl font-bold leading-none tracking-[-0.06em] sm:text-[11rem]">{code}</p>
          <h1 className="mt-6 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-600">{message}</p>

          {suggestions && (
            <form action="/search/" method="get" role="search" className="mx-auto mt-8 flex max-w-lg gap-2">
              <label htmlFor="err-q" className="sr-only">
                Search the site
              </label>
              <input id="err-q" type="search" name="q" placeholder="Search services or articles…" className="form-input !bg-white" />
              <button className="btn btn-primary" type="submit">
                <Icon name="search" className="size-4" /> Search
              </button>
            </form>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary btn-lg">
              Go to homepage
            </Link>
            <Link href="/contact/" className="btn btn-secondary btn-lg">
              Contact us
            </Link>
          </div>
        </div>
      </section>

      {popular_services.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Popular" title="Popular services" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {popular_services.map((s, i) => (
                <ServiceCard key={s.url} service={s} index={i} />
              ))}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
              {[
                ["/blog/", "Blog"],
                ["/portfolio/", "Portfolio"],
                ["/industries/", "Industries"],
                ["/about-us/", "About us"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="chip !px-4 !py-2 hover:border-brand">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
