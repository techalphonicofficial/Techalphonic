/* Shapes returned by Laravel's site API (app/Http/Controllers/Api/V1/SiteController.php + App\Support\SitePresenter). */

export type Media = {
  id: number;
  url: string;
  webp: string | null;
  avif: string | null;
  srcset: string | null;
  width: number | null;
  height: number | null;
  alt: string | null;
  title: string | null;
  caption: string | null;
  mime: string | null;
};

export type MenuItem = {
  label: string;
  url: string | null;
  icon: string | null;
  description: string | null;
  mega: boolean;
  new_tab: boolean;
  is_heading: boolean;
  children: MenuItem[];
};

export type ServiceCard = { name: string; url: string; description: string | null; icon: string | null };

export type Settings = {
  site_name: string;
  site_tagline: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  phone: string | null;
  phone_secondary: string | null;
  phone_secondary_href: string | null;
  email: string | null;
  sales_email: string | null;
  map_embed_url: string | null;
  business_hours: string | null;
  whatsapp_enabled: boolean;
  whatsapp_position: string | null;
  call_enabled: boolean;
  call_text: string | null;
  twitter_handle: string | null;
  discourage_indexing: boolean;
  ga4_id: string | null;
  gtm_id: string | null;
  gsc_verification: string | null;
  meta_pixel_id: string | null;
  head_scripts: string | null;
  body_scripts: string | null;
  lead_success_message: string | null;
  recaptcha_enabled: boolean;
  budget_options: string | null;
  popup_enabled: boolean;
  popup_delay: string | number | null;
  popup_badge: string | null;
  popup_title: string | null;
  popup_text: string | null;
  popup_points: string | null;
  quote_tab_enabled: boolean;
  footer_about: string | null;
  footer_cta_heading: string | null;
  footer_cta_text: string | null;
  logo: Media | null;
  logo_dark: Media | null;
  favicon: Media | null;
  popup_image: Media | null;
  whatsapp_url: string | null;
  phone_href: string | null;
  call_href: string | null;
  full_address: string | null;
  copyright: string;
  recaptcha_site_key: string | null;
  form_services: string[];
};

export type Social = { platform: string; url: string; icon: string };

export type Layout = {
  settings: Settings;
  menus: Record<string, MenuItem[]>;
  menu_titles?: Record<string, string>;
  socials: Social[];
  popular_services: ServiceCard[];
  home_url: string;
};

export type Crumb = { name: string; url: string | null };

export type Seo = {
  title: string;
  description: string | null;
  keywords: string | null;
  canonical: string | null;
  robots: string;
  indexable: boolean;
  og_title: string;
  og_description: string | null;
  og_image: string | null;
  og_type: string;
  twitter_title: string;
  twitter_description: string | null;
  twitter_image: string | null;
  prev_url: string | null;
  next_url: string | null;
  published_time: string | null;
  modified_time: string | null;
  alternates: Record<string, string>;
  breadcrumbs: Crumb[];
  schema_json: string | null;
};

export type Faq = { id: number | null; question: string; answer: string };
export type LinkGroup = { title: string; links: { name: string; url: string; description?: string | null; icon?: string | null }[] };

export type BlogCard = {
  title: string;
  url: string;
  excerpt: string | null;
  reading_time: number | null;
  published_at: string | null;
  featured_image: Media | null;
  category: { name: string; url: string } | null;
};

export type Testimonial = {
  name: string;
  designation: string | null;
  company: string | null;
  rating: number;
  review: string;
  initials: string;
  photo: Media | null;
};

export type Industry = {
  id: number;
  name: string;
  slug: string;
  plural_name: string | null;
  description: string | null;
  icon: string | null;
  image?: Media | null;
  challenges: (string | { title?: string })[];
  solutions: (string | { title?: string })[];
  benefits?: Item[];
  url?: string | null;
  pages?: { name: string; url: string }[];
};

export type Metric = { value?: string; label?: string };

export type CaseStudyCard = {
  title: string;
  url: string;
  client: string | null;
  summary: string | null;
  metrics: Metric[];
  featured_image: Media | null;
  industry: { name: string } | null;
  service: { name: string; url: string } | null;
};

export type PortfolioCard = {
  title: string;
  url: string;
  category: string | null;
  summary: string | null;
  featured_image: Media | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type BlockData = Record<string, any>;

export type Block = {
  type: string;
  data: BlockData;
  background: string;
  dark: boolean;
  center: boolean;
  media: Record<string, Media>;
  extra: Record<string, any>;
};

export type Item = { title?: string; text?: string; icon?: string; value?: string; suffix?: string; label?: string; [k: string]: any };

export type HomeSection = { key: string; title: string | null; subtitle: string | null; eyebrow: string | null; content: Record<string, any> };

export type HomeData = {
  sections: HomeSection[];
  media: Record<string, Media>;
  promo_image_id: number | null;
  hero: {
    heading: string;
    subheading: string | null;
    description: string | null;
    badge: string | null;
    trust_text: string | null;
    cta_text: string | null;
    cta_url: string | null;
    secondary_cta_text: string | null;
    secondary_cta_url: string | null;
    show_form: boolean;
    image: Media | null;
    background: Media | null;
    background_video: Media | null;
    showreel_url: string | null;
  } | null;
  categories: {
    name: string;
    slug: string;
    menu_label: string | null;
    heading: string;
    short_description: string | null;
    icon: string | null;
    image?: Media | null;
    url: string;
    services_count: number;
    services: ServiceCard[];
  }[];
  industries: Industry[];
  testimonials: Testimonial[];
  portfolio: PortfolioCard[];
  case_studies: CaseStudyCard[];
  blogs: BlogCard[];
  faqs: Faq[];
  links: { portfolio: string; industries: string; blog: string; about: string };
};

type Common = { faqs: Faq[]; related: LinkGroup[]; is_preview: boolean };

export type PageData = Common & {
  template: "default" | "about" | "contact" | "legal" | "hub" | "packages";
  page: {
    title: string;
    heading: string;
    hero_subheading: string | null;
    hero_layout: string;
    excerpt: string | null;
    content: string | null;
    slug?: string;
    updated_at: string | null;
    featured_image: Media | null;
  };
  blocks: Block[];
  children: ServiceCard[];
  tagline: string | null;
  links: { portfolio: string; contact: string };
  testimonials?: Testimonial[];
};

export type LocationPageLink = {
  title: string;
  url: string;
  service?: string | null;
  is_dedicated?: boolean;
};

/** A locality inside a city ("Sector 62" in Noida). */
export type LocationArea = {
  name: string;
  slug: string;
  url: string;
  description?: string | null;
};

export type LocationItem = {
  name: string;
  slug?: string;
  country: string;
  state: string | null;
  type: string;
  url: string;
  title?: string;
  pages?: LocationPageLink[];
  areas?: LocationArea[];
};

export type ServiceData = Common & {
  service: {
    name: string;
    heading: string;
    hero_description: string | null;
    hero_layout: string;
    hero_image: Media | null;
    hero_highlights?: Item[];
    description: string | null;
    content: string | null;
    features: Item[];
    benefits: Item[];
    process: Item[];
    technologies: Item[];
    pricing: Item[];
    cta_heading: string | null;
    cta_description: string | null;
    category: { name: string } | null;
  };
  locations?: LocationItem[];
  blocks: Block[];
  case_studies: CaseStudyCard[];
  testimonials: Testimonial[];
  blogs: BlogCard[];
  children: { name: string; url: string }[];
};

export type CategoryData = Common & {
  category: { name: string; heading: string; short_description: string | null; description: string | null; image: Media | null };
  locations?: LocationItem[];
  services: ServiceCard[];
  blocks: Block[];
  testimonials: Testimonial[];
};

export type LandingData = Common & {
  page: { hero_layout: string; faq_enabled: boolean; faq_title: string | null; featured_image: Media | null };
  service: { name: string } | null;
  /** city_slug: the directory entry (city) whose areas this page belongs to. */
  location: {
    name: string;
    slug?: string;
    city_slug?: string | null;
    description?: string | null;
    address?: string | null;
    postal_code?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  industry: Industry | null;
  site_name: string;
  h1: string;
  subheading: string | null;
  introduction: string | null;
  content: string | null;
  sections: { heading?: string; content?: string }[];
  benefits: Item[];
  process: Item[];
  why_choose_us: Item[];
  cta: { heading?: string | null; text?: string | null; button_text?: string | null; button_url?: string | null };
  local_facts: (string | { text?: string })[];
  industries: Industry[];
  testimonials: Testimonial[];
  blogs: BlogCard[];
  locations?: LocationItem[];
  blocks: Block[];
};

export type BlogData = Common & {
  blog: {
    title: string;
    excerpt: string | null;
    html: string;
    toc: { id: string; text: string; level: number }[];
    reading_time: number | null;
    published_at: string | null;
    updated_at: string | null;
    faq_enabled: boolean;
    featured_image: Media | null;
    category: { name: string; url: string } | null;
    tags: { name: string; url: string }[];
    author: { name: string; designation: string | null; bio: string | null; avatar: Media | null } | null;
  };
  blogs: BlogCard[];
  contact_url: string;
};

export type PortfolioData = Common & {
  item: PortfolioCard & {
    client: string | null;
    description: string | null;
    results: string | null;
    project_url: string | null;
    technologies: string[];
    industry: { name: string } | null;
    service: { name: string; url: string } | null;
    gallery: Media[];
  };
  contact_url: string;
};

export type CaseStudyData = Common & {
  study: CaseStudyCard & {
    challenge: string | null;
    solution: string | null;
    results: string | null;
    technologies: string[];
    testimonial: Testimonial | null;
    gallery?: Media[];
  };
  contact_url: string;
};

export type BlogIndexData = {
  heading: string;
  intro: string | null;
  posts: BlogCard[];
  pagination: { current: number; last: number; base: string; prev: string | null; next: string | null; pages: { page: number; url: string }[] };
  categories: { id: number; name: string; url: string; count: number }[];
  active_category: number | null;
  blog_url: string;
};

export type SearchResult = { type: string; title: string; url: string; excerpt: string | null };

export type Resolved =
  | { kind: "home"; seo: Seo; data: HomeData }
  | { kind: "page"; seo: Seo; data: PageData }
  | { kind: "service"; seo: Seo; data: ServiceData }
  | { kind: "category"; seo: Seo; data: CategoryData }
  | { kind: "landing"; seo: Seo; data: LandingData }
  | { kind: "blog"; seo: Seo; data: BlogData }
  | { kind: "portfolio"; seo: Seo; data: PortfolioData }
  | { kind: "case_study"; seo: Seo; data: CaseStudyData }
  | { kind: "blog_index"; seo: Seo; data: BlogIndexData }
  | { kind: "portfolio_index"; seo: Seo; data: { items: PortfolioCard[]; categories: string[] } }
  | { kind: "case_study_index"; seo: Seo; data: { studies: CaseStudyCard[] } }
  | { kind: "industries"; seo: Seo; data: { industries: Industry[] } }
  | { kind: "search"; seo: Seo; data: { q: string; results: SearchResult[] } }
  | { kind: "not_found" };
