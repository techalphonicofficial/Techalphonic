import { HomeSections } from "@/components/home/HomeSections";
import { RevealScope } from "@/components/runtime/Runtime";
import { SeoExtras } from "@/lib/metadata";
import type { Resolved } from "@/lib/types";
import { BlogIndex, BlogPost, CaseStudyIndex, CaseStudyShow, IndustriesPage, PortfolioIndex, PortfolioShow } from "./CollectionPages";
import { CategoryPage, CmsPage, LandingPage, ServicePage } from "./ContentPages";

/** Picks the template for a resolved payload (Laravel's ContentPageRenderer view switch). */
export function Render({ r }: { r: Exclude<Resolved, { kind: "not_found" }> }) {
  const body = (() => {
    switch (r.kind) {
      case "home":
        return <HomeSections data={r.data} />;
      case "page":
        return <CmsPage data={r.data} seo={r.seo} />;
      case "service":
        return <ServicePage data={r.data} seo={r.seo} />;
      case "category":
        return <CategoryPage data={r.data} seo={r.seo} />;
      case "landing":
        return <LandingPage data={r.data} seo={r.seo} />;
      case "blog":
        return <BlogPost data={r.data} seo={r.seo} />;
      case "blog_index":
        return <BlogIndex data={r.data} seo={r.seo} />;
      case "portfolio":
        return <PortfolioShow data={r.data} seo={r.seo} />;
      case "portfolio_index":
        return <PortfolioIndex data={r.data} seo={r.seo} />;
      case "case_study":
        return <CaseStudyShow data={r.data} seo={r.seo} />;
      case "case_study_index":
        return <CaseStudyIndex data={r.data} seo={r.seo} />;
      case "industries":
        return <IndustriesPage data={r.data} seo={r.seo} />;
      default:
        return null;
    }
  })();

  const preview = "is_preview" in r.data && r.data.is_preview;
  return (
    <>
      {preview && <div className="sticky top-0 z-[60] bg-amber px-4 py-2 text-center text-sm font-semibold text-ink">Preview mode — this page is not public and is hidden from search engines.</div>}
      <SeoExtras seo={r.seo} />
      {body}
      <RevealScope />
    </>
  );
}
