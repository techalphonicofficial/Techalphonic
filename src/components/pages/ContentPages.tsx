import Link from "next/link";
import { asBlock, BlockBody, Blocks, IndustryGrid } from "@/components/blocks/Blocks";
import { Icon } from "@/components/ui/Icon";
import { BrandSquares, Html, SectionHeading } from "@/components/ui/basics";
import { BlogCard, ServiceCard, TestimonialCard } from "@/components/ui/cards";
import { Cta, EnquirySection, FaqSection, PageHero, RelatedLinks } from "@/components/ui/sections";
import { LocationDirectory } from "@/components/ui/LocationDirectory";
import { LeadForm } from "@/components/forms/LeadForm";
import { PackagesPage } from "@/components/pages/PackagesPage";
import { getLayout } from "@/lib/api";
import type { Block, CategoryData, LandingData, PageData, Seo, ServiceData } from "@/lib/types";
import { cn, formatDate, itemTitle, lines } from "@/lib/utils";

/* CMS page templates (port of resources/views/frontend/pages/*, services/*, landing/show). */

const pIntro = (text: string | null | undefined) => (text ? `<p>${escapeHtml(text)}</p>` : null);

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const hasType = (blocks: Block[], type: string) => blocks.some((b) => b.type === type);

// ---------------------------------------------------------------- pages/*

export async function CmsPage({ data, seo }: { data: PageData; seo: Seo }) {
  if (data.template === "packages" || data.page.slug === "packages") {
    return <PackagesPage data={data} seo={seo} />;
  }

  switch (data.template) {
    case "about":
      return <AboutPage data={data} seo={seo} />;
    case "contact":
      return <ContactPage data={data} seo={seo} />;
    case "legal":
      return <LegalPage data={data} seo={seo} />;
    case "hub":
      return <HubPage data={data} seo={seo} />;
    default:
      return <DefaultPage data={data} seo={seo} />;
  }
}

function DefaultPage({ data, seo }: { data: PageData; seo: Seo }) {
  const { page, blocks } = data;
  return (
    <>
      {blocks[0]?.type !== "hero" ? (
        <PageHero title={page.heading} subtitle={page.hero_subheading} intro={pIntro(page.excerpt)} breadcrumbs={seo.breadcrumbs} image={page.featured_image} layout={page.hero_layout} />
      ) : (
        /* First block is a hero: keep a visually hidden H1 so every page has exactly one. */
        <h1 className="sr-only">{page.heading}</h1>
      )}
      {page.content && (
        <section className="section">
          <div className="container-x">
            <Html as="article" html={page.content} className="prose-content mx-auto max-w-4xl" />
          </div>
        </section>
      )}
      <Blocks blocks={blocks} />
      {!hasType(blocks, "faq") && <FaqSection faqs={data.faqs} />}
      <RelatedLinks groups={data.related} />
    </>
  );
}

function AboutPage({ data, seo }: { data: PageData; seo: Seo }) {
  const { page, blocks } = data;
  return (
    <>
      <PageHero
        title={page.heading}
        eyebrow="About us"
        subtitle={page.hero_subheading}
        intro={pIntro(page.excerpt)}
        breadcrumbs={seo.breadcrumbs}
        image={page.featured_image}
        layout={page.hero_layout}
        actions={
          <>
            <Link href={data.links.contact} className="btn btn-primary btn-lg" data-cta="about-hero">
              Work with us <Icon name="arrow-right" className="size-4" />
            </Link>
            <Link href={data.links.portfolio} className="btn btn-secondary btn-lg">
              See our work
            </Link>
          </>
        }
      />
      {page.content && (
        <section className="section">
          <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.4fr]">
            <div data-reveal="">
              <BrandSquares className="origin-top-left scale-[2.2]" />
              <p className="mt-8 font-display text-2xl font-bold leading-snug text-ink">{data.tagline}</p>
            </div>
            <Html as="article" html={page.content} className="prose-content" data-reveal="" />
          </div>
        </section>
      )}
      <Blocks blocks={blocks} />
      {!hasType(blocks, "faq") && <FaqSection faqs={data.faqs} />}
      <Cta />
    </>
  );
}

async function ContactPage({ data, seo }: { data: PageData; seo: Seo }) {
  const { settings: s, socials } = await getLayout();
  const { page, blocks } = data;
  const hours = lines(s.business_hours);
  const wa = s.whatsapp_enabled ? s.whatsapp_url : null;
  const map = s.map_embed_url;
  const row = "group flex items-center gap-4 p-5 transition hover:bg-cloud";

  return (
    <>
      <PageHero title={page.heading} eyebrow="Contact" subtitle={page.hero_subheading} intro={pIntro(page.excerpt)} breadcrumbs={seo.breadcrumbs} layout="minimal" actions={false} />

      <section className="section !pt-8">
        <div className="container-x grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12">
          <div>
            <p className="eyebrow">Reach us directly</p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">We’d love to hear about your project</h2>
            <p className="mt-2.5 text-ink-500">Prefer to talk? Call or WhatsApp us — a specialist (not a call centre) will pick up.</p>

            <ul className="mt-5 divide-y divide-line rounded-[1.75rem] border border-line bg-white" role="list">
              {s.phone && (
                <li>
                  <a href={s.phone_href ?? undefined} className={row}>
                    <span className="icon-tile icon-grad size-11 rounded-xl">
                      <Icon name="phone" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium text-ink-500">Call us</span>
                      <span className="block font-semibold text-ink">{s.phone}</span>
                    </span>
                    <Icon name="arrow-up-right" className="size-4 text-ink-500 transition group-hover:text-brand" />
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <a href={wa} target="_blank" rel="noopener" className={row}>
                    <span className="icon-tile size-11 rounded-xl bg-[#25D366] text-white">
                      <Icon name="whatsapp" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium text-ink-500">WhatsApp</span>
                      <span className="block font-semibold text-ink">Chat with our team</span>
                    </span>
                    <Icon name="arrow-up-right" className="size-4 text-ink-500 transition group-hover:text-brand" />
                  </a>
                </li>
              )}
              {s.email && (
                <li>
                  <a href={`mailto:${s.email}`} className={row}>
                    <span className="icon-tile size-11 rounded-xl bg-teal text-white">
                      <Icon name="mail" className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium text-ink-500">Email</span>
                      <span className="block truncate font-semibold text-ink">{s.email}</span>
                    </span>
                    <Icon name="arrow-up-right" className="size-4 text-ink-500 transition group-hover:text-brand" />
                  </a>
                </li>
              )}
              {s.full_address && (
                <li className="flex items-start gap-4 p-5">
                  <span className="icon-tile size-11 rounded-xl bg-amber text-ink">
                    <Icon name="map-pin" className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-ink-500">Office</span>
                    <address className="font-semibold not-italic leading-relaxed text-ink">{s.full_address}</address>
                  </span>
                </li>
              )}
              {hours.length > 0 && (
                <li className="flex items-start gap-4 p-5">
                  <span className="icon-tile size-11 rounded-xl bg-mist text-ink-700">
                    <Icon name="clock" className="size-5" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium text-ink-500">Business hours</span>
                    {hours.map((h) => (
                      <span key={h} className="block font-semibold text-ink">
                        {h}
                      </span>
                    ))}
                  </span>
                </li>
              )}
            </ul>

            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm font-medium text-ink-500">Follow us</span>
                {socials.map((so) => (
                  <a key={so.url} href={so.url} target="_blank" rel="noopener me" className="grid size-10 place-items-center rounded-full border border-line text-ink-700 transition hover:border-brand hover:bg-brand hover:text-white" aria-label={so.platform}>
                    <Icon name={so.icon} className="size-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div id="enquire" className="scroll-mt-28 lg:justify-self-end">
            <LeadForm formName="contact-page" title="Send us a message" subtitle="We usually reply within a few hours on business days." />
          </div>
        </div>
      </section>

      {page.content && (
        <section className="section-sm">
          <div className="container-x">
            <Html html={page.content} className="prose-content mx-auto max-w-3xl" />
          </div>
        </section>
      )}

      {map && map.startsWith("https://www.google.com/maps") && (
        <section className="pb-10">
          <div className="container-x">
            <div className="relative overflow-hidden rounded-[2rem] border border-line shadow-[var(--shadow-card)]">
              <iframe src={map} title={`Map: ${s.site_name} office`} className="h-[360px] w-full grayscale-[35%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
              {s.full_address && (
                <div className="absolute bottom-5 left-5 max-w-xs rounded-2xl bg-white p-5 shadow-[var(--shadow-lift)]">
                  <p className="font-bold text-ink">{s.site_name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.full_address}</p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.full_address)}`} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                    Get directions <Icon name="arrow-up-right" className="size-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <Blocks blocks={blocks} />
      <FaqSection faqs={data.faqs} />
    </>
  );
}

function LegalPage({ data, seo }: { data: PageData; seo: Seo }) {
  const { page } = data;
  return (
    <>
      <PageHero title={page.heading} breadcrumbs={seo.breadcrumbs} layout="minimal" actions={false}>
        <p className="text-sm text-steel">Last updated: {formatDate(page.updated_at, "long")}</p>
      </PageHero>
      <section className="section">
        <div className="container-x">
          <Html as="article" html={page.content} className="prose-content mx-auto max-w-3xl" />
        </div>
      </section>
    </>
  );
}

function HubPage({ data, seo }: { data: PageData; seo: Seo }) {
  const { page } = data;
  return (
    <>
      <PageHero title={page.heading} subtitle={page.hero_subheading} intro={pIntro(page.excerpt)} breadcrumbs={seo.breadcrumbs} layout="centered" />
      {data.children.length > 0 && (
        <section className="section">
          <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.children.map((c, i) => (
              <ServiceCard key={c.url} service={c} index={i} />
            ))}
          </div>
        </section>
      )}
      {page.content && (
        <section className="section-sm bg-mist">
          <div className="container-x">
            <Html html={page.content} className="prose-content mx-auto max-w-4xl" />
          </div>
        </section>
      )}
      <Blocks blocks={data.blocks} />
      <FaqSection faqs={data.faqs} />
      <Cta />
    </>
  );
}

// ---------------------------------------------------------------- services/show

export async function ServicePage({ data, seo }: { data: ServiceData; seo: Seo }) {
  const { settings } = await getLayout();
  const { service, blocks } = data;
  const highlights = (
    service.hero_highlights && service.hero_highlights.length > 0
      ? service.hero_highlights
      : (service.benefits.length ? service.benefits : service.features)
  ).slice(0, 4);

  return (
    <>
      <PageHero
        title={service.heading}
        eyebrow={service.category?.name}
        intro={pIntro(service.hero_description)}
        breadcrumbs={seo.breadcrumbs}
        image={service.hero_image}
        layout={service.hero_layout}
        form={["split", "image-bg", "dark"].includes(service.hero_layout || "split")}
        formService={service.name}
        aside={
          highlights.length > 0 ? (
            <>
              <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-brand/20 via-transparent to-teal/20 blur-3xl" />
              <div className="ring-gradient relative rounded-[1.75rem] bg-white/95 p-7 shadow-[var(--shadow-lift)] backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">What you get</p>
                <ul className="mt-5 grid gap-4" role="list">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-brand">
                        <Icon name={h.icon ?? "check"} className="size-[18px]" />
                      </span>
                      <span>
                        <span className="block font-semibold text-ink">{h.title}</span>
                        {h.text && <span className="mt-0.5 block text-sm leading-relaxed text-ink-500">{h.text}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                <a href="#enquire" className="btn btn-primary mt-7 w-full" data-cta="service-hero-card">
                  Get a free proposal
                </a>
              </div>
            </>
          ) : undefined
        }
      />

      {blocks.length > 0 ? (
        <Blocks blocks={blocks} />
      ) : (
        /* Default service layout; every section only renders when it has content. */
        <>
          {(service.content || service.description) && (
            <section className="section">
              <div className="container-x grid gap-12 lg:grid-cols-[1fr_360px]">
                <article className="prose-content max-w-none" data-reveal="">
                  {service.description && <p className="lead !text-ink">{service.description}</p>}
                  {service.content && <div dangerouslySetInnerHTML={{ __html: service.content }} />}
                </article>
                <aside className="grid content-start gap-5 lg:sticky lg:top-28 lg:self-start">
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-amber-50 p-7">
                    <div className="glow-teal absolute -right-16 -top-16 size-56" />
                    <span className="icon-tile icon-grad relative size-11 rounded-xl">
                      <Icon name="sparkles" className="size-5" />
                    </span>
                    <p className="relative mt-5 text-xl font-bold leading-snug">{service.cta_heading || `Talk to a ${service.name} expert`}</p>
                    <p className="relative mt-2 text-sm leading-relaxed text-ink-500">{service.cta_description || "Free consultation and a clear, no-obligation proposal."}</p>
                    <a href="#enquire" className="btn btn-primary relative mt-6 w-full" data-cta="service-sidebar">
                      Get a free proposal
                    </a>
                    {settings.phone && (
                      <a href={settings.call_href ?? undefined} className="btn btn-secondary relative mt-3 w-full">
                        <Icon name="phone" className="size-4" /> {settings.phone}
                      </a>
                    )}
                  </div>
                  {data.children.length > 0 && (
                    <nav className="rounded-[1.75rem] border border-line bg-white p-6" aria-label={`${service.name} services`}>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-500">{service.name} services</p>
                      <ul className="mt-3 grid gap-0.5" role="list">
                        {data.children.map((c) => (
                          <li key={c.url}>
                            <Link href={c.url} className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-mist hover:text-ink">
                              {c.name} <Icon name="arrow-right" className="size-4 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  )}
                </aside>
              </div>
            </section>
          )}

          {service.features.length > 0 && (
            <section className="section bg-mist">
              <div className="container-x">
                <SectionHeading eyebrow="What's included" title={`Our ${service.name} services`} />
                <BlockBody block={asBlock("feature_cards", service.features)} />
              </div>
            </section>
          )}

          {service.benefits.length > 0 && (
            <section className="section">
              <div className="container-x">
                <SectionHeading eyebrow="Why it matters" title={`Benefits of ${service.name}`} />
                <BlockBody block={asBlock("benefits", service.benefits)} />
              </div>
            </section>
          )}

          {service.process.length > 0 && <DarkProcess eyebrow="How we work" title="A proven, transparent process" items={service.process} />}

          {service.technologies.length > 0 && (
            <section className="section-sm">
              <div className="container-x">
                <SectionHeading eyebrow="Technology" title="Tools & technologies we use" />
                <BlockBody block={asBlock("technologies", service.technologies)} />
              </div>
            </section>
          )}

          {service.pricing.length > 0 && (
            <section className="section bg-mist">
              <div className="container-x">
                <SectionHeading eyebrow="Pricing" title={`${service.name} packages`} subtitle="Transparent plans. Custom quotes available for larger projects." />
                <BlockBody block={asBlock("pricing", service.pricing)} />
              </div>
            </section>
          )}

          {data.case_studies.length > 0 && (
            <section className="section">
              <div className="container-x">
                <SectionHeading eyebrow="Results" title="Proof, not promises" />
                <BlockBody block={{ ...asBlock("case_studies", []), extra: { studies: data.case_studies } }} />
              </div>
            </section>
          )}

          {data.testimonials.length > 0 && (
            <section className="section bg-mist">
              <div className="container-x">
                <SectionHeading eyebrow="Testimonials" title="What our clients say" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {data.testimonials.slice(0, 3).map((t, i) => (
                    <TestimonialCard key={i} testimonial={t} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {!hasType(blocks, "faq") && <FaqSection faqs={data.faqs} title={`${service.name} — FAQs`} />}

      {data.locations && data.locations.length > 0 && (
        <LocationDirectory locations={data.locations} serviceName={service.name} />
      )}

      {data.blogs.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Insights" title={`Learn more about ${service.name}`} />
            <div className="grid gap-6 md:grid-cols-3">
              {data.blogs.map((p) => (
                <BlogCard key={p.url} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <EnquirySection heading={service.cta_heading || `Ready to get started with [[${service.name}]]?`} text={service.cta_description} service={service.name} formName="service-page" />
      <RelatedLinks groups={data.related} />
    </>
  );
}

function DarkProcess({ eyebrow, title, items }: { eyebrow: string; title: string; items: unknown[] }) {
  return (
    <section className="section section-dark noise">
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="mesh">
        <span className="-left-40 top-0 size-[32rem] bg-teal/25" />
        <span className="-right-32 bottom-0 size-[26rem] bg-amber/15 [animation-delay:-9s]" />
      </div>
      <div className="container-x relative">
        <SectionHeading eyebrow={eyebrow} title={title} dark />
        <BlockBody block={asBlock("process", items, true)} />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- services/category

export function CategoryPage({ data, seo }: { data: CategoryData; seo: Seo }) {
  const { category, blocks } = data;
  return (
    <>
      <PageHero title={category.heading} eyebrow="Services" intro={pIntro(category.short_description)} breadcrumbs={seo.breadcrumbs} image={category.image} layout="centered" />
      <section className="section">
        <div className="container-x">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.services.map((s, i) => (
              <ServiceCard key={s.url} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>
      {category.description && (
        <section className="section-sm bg-mist">
          <div className="container-x">
            <Html html={category.description} className="prose-content mx-auto max-w-4xl" data-reveal="" />
          </div>
        </section>
      )}
      <Blocks blocks={blocks} />
      {data.testimonials.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Testimonials" title="Trusted by growing businesses" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.testimonials.slice(0, 3).map((t, i) => (
                <TestimonialCard key={i} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}
      {!hasType(blocks, "faq") && <FaqSection faqs={data.faqs} />}
      {data.locations && data.locations.length > 0 && (
        <LocationDirectory locations={data.locations} serviceName={category.name} />
      )}
      <Cta />
    </>
  );
}

// ---------------------------------------------------------------- landing/show (programmatic SEO page)

export function LandingPage({ data, seo }: { data: LandingData; seo: Seo }) {
  const { page, service, location, industry, blocks } = data;
  const eyebrow = [service?.name, industry?.name, location?.name].filter(Boolean).join(" · ");
  const layout = page.hero_layout;

  return (
    <>
      <PageHero
        title={data.h1}
        eyebrow={eyebrow}
        subtitle={data.subheading}
        intro={data.introduction}
        breadcrumbs={seo.breadcrumbs}
        image={page.featured_image}
        layout={layout}
        form={["split", "image-bg", "dark"].includes(layout)}
        formService={service?.name}
        formLocation={location?.name}
      />

      {data.content && (
        <section className="section">
          <div className="container-x">
            <Html as="article" html={data.content} className="prose-content mx-auto max-w-4xl" data-reveal="" />
          </div>
        </section>
      )}

      {/* Custom per-page sections (unique copy) */}
      {data.sections.map((s, i) =>
        s.heading || s.content ? (
          <section key={i} className={cn("section", i % 2 && "bg-mist")}>
            <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <h2 className="h-section" data-reveal="">
                {s.heading}
              </h2>
              <Html html={s.content} className="prose-content" data-reveal="" />
            </div>
          </section>
        ) : null,
      )}

      {blocks.length > 0 && <Blocks blocks={blocks} />}

      {data.local_facts.length > 0 && location && (
        <section className="section-sm">
          <div className="container-x">
            <div className="rounded-[2rem] border border-line bg-gradient-to-br from-teal-50 via-white to-amber-50 p-8 sm:p-12" data-reveal="">
              <p className="eyebrow">Local insight</p>
              <h2 className="h-section mt-4">Doing business in {location.name}</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2" role="list">
                {data.local_facts.map((fact, i) => (
                  <li key={i} className="flex gap-3">
                    <Icon name="map-pin" className="mt-0.5 size-5 shrink-0 text-brand" />
                    <span>{typeof fact === "string" ? fact : fact.text ?? ""}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {data.benefits.length > 0 && (
        <section className="section bg-mist">
          <div className="container-x">
            <SectionHeading
              eyebrow="Benefits"
              title={`Why invest in ${service?.name ?? "this service"}${location ? ` in ${location.name}` : ""}${industry ? ` for ${industry.plural_name || industry.name}` : ""}`}
            />
            <BlockBody block={asBlock("benefits", data.benefits)} />
          </div>
        </section>
      )}

      {industry && (industry.challenges.length > 0 || industry.solutions.length > 0) && (
        <section className="section">
          <div className="container-x grid gap-8 lg:grid-cols-2">
            {industry.challenges.length > 0 && (
              <div className="rounded-[2rem] border border-line p-8" data-reveal="">
                <p className="eyebrow">The challenge</p>
                <h2 className="mt-4 text-2xl font-bold">What {industry.plural_name || industry.name} struggle with</h2>
                <ul className="mt-6 grid gap-3" role="list">
                  {industry.challenges.map((c, i) => (
                    <li key={i} className="flex gap-3">
                      <Icon name="x" className="mt-1 size-4 shrink-0 text-brand" />
                      {itemTitle(c)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {industry.solutions.length > 0 && (
              <div className="rounded-[2rem] border border-brand-100 bg-gradient-to-br from-brand-50 to-teal-50 p-8" data-reveal="" data-aos="fade-left">
                <p className="eyebrow">Our approach</p>
                <h2 className="mt-4 text-2xl font-bold text-ink">How we solve it</h2>
                <ul className="mt-6 grid gap-3" role="list">
                  {industry.solutions.map((s, i) => (
                    <li key={i} className="flex gap-3">
                      <Icon name="check-circle" className="mt-0.5 size-5 shrink-0 text-teal" />
                      {itemTitle(s)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {data.process.length > 0 && <DarkProcess eyebrow="Our process" title="How we deliver results" items={data.process} />}

      {data.why_choose_us.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow={`Why ${data.site_name}`} title={`Why choose ${data.site_name}${location ? ` in ${location.name}` : ""}`} />
            <BlockBody block={asBlock("feature_cards", data.why_choose_us)} />
          </div>
        </section>
      )}

      {data.industries.length > 0 && (
        <section className="section-sm bg-mist">
          <div className="container-x">
            <SectionHeading eyebrow="Industries" title={`Industries we serve${location ? ` in ${location.name}` : ""}`} />
            <IndustryGrid industries={data.industries} />
          </div>
        </section>
      )}

      {data.testimonials.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Client stories" title="What our clients say" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.testimonials.slice(0, 3).map((t, i) => (
                <TestimonialCard key={i} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {page.faq_enabled && !hasType(blocks, "faq") && <FaqSection faqs={data.faqs} title={page.faq_title || "Frequently asked questions"} />}

      {data.blogs.length > 0 && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Resources" title="Helpful guides" />
            <div className="grid gap-6 md:grid-cols-3">
              {data.blogs.map((p) => (
                <BlogCard key={p.url} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <EnquirySection heading={data.cta.heading} text={data.cta.text} service={service?.name} location={location?.name} formName="landing-page" />
      <RelatedLinks groups={data.related} />
    </>
  );
}
