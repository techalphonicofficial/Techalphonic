import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Suspense } from "react";
import { Header, HeaderWithPathname } from "@/components/layout/Header";
import { FloatingActions, Overlays } from "@/components/runtime/Overlays";
import { RawHtml } from "@/components/runtime/RawHtml";
import { Runtime } from "@/components/runtime/Runtime";
import { SiteProvider } from "@/components/runtime/site-context";
import { getLayout, SITE_URL } from "@/lib/api";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap", axes: ["opsz"] });

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getLayout();
  return {
    metadataBase: new URL(SITE_URL),
    icons: settings.favicon ? { icon: settings.favicon.url, apple: settings.favicon.url } : undefined,
    verification: settings.gsc_verification ? { google: settings.gsc_verification } : undefined,
  };
}

const HEX = /^#[0-9a-f]{6}$/i;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const layout = await getLayout();
  const s = layout.settings;
  const colors = `:root{--brand-primary:${HEX.test(s.primary_color ?? "") ? s.primary_color : "#167B8B"};--brand-secondary:${HEX.test(s.secondary_color ?? "") ? s.secondary_color : "#53AFBE"};--brand-accent:${HEX.test(s.accent_color ?? "") ? s.accent_color : "#FEB449"}}`;

  return (
    // suppressHydrationWarning: the inline script below adds the "js" class before React hydrates.
    <html lang="en-IN" className={`${jakarta.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <style dangerouslySetInnerHTML={{ __html: colors }} />
        {/* Scroll reveals hide [data-aos] only once JS is known to run; if the runtime never boots, show everything. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');setTimeout(function(){if(!window.__taReady)document.documentElement.classList.add('no-reveal')},3000);" }} />
        {s.gtm_id ? (
          <script dangerouslySetInnerHTML={{ __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(s.gtm_id)});` }} />
        ) : s.ga4_id ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(s.ga4_id)}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(s.ga4_id)});` }} />
          </>
        ) : null}
        {s.meta_pixel_id && (
          <script dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(s.meta_pixel_id)});fbq('track','PageView');` }} />
        )}
        {s.recaptcha_site_key && <script src={`https://www.google.com/recaptcha/api.js?render=${s.recaptcha_site_key}`} async defer />}
      </head>
      <body className="min-h-screen bg-white">
        {s.gtm_id && (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(s.gtm_id)}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
          </noscript>
        )}
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <SiteProvider layout={layout}>
          {/* Fallback = the same header without the active-link state (only seen on dynamic routes like /search). */}
          <Suspense fallback={<Header pathname="" />}>
            <HeaderWithPathname />
          </Suspense>
          <main id="main">{children}</main>
          <Footer layout={layout} />
          <FloatingActions />
          <Overlays />
          <Runtime />
          <RawHtml html={s.head_scripts} target="head" />
          <RawHtml html={s.body_scripts} target="body" />
        </SiteProvider>
      </body>
    </html>
  );
}
