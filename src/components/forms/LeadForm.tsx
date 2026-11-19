"use client";

import { useId, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { storage, track, useSite } from "@/components/runtime/site-context";
import { cn, lines } from "@/lib/utils";

type Props = {
  title?: string;
  subtitle?: string;
  service?: string | null;
  location?: string | null;
  formName?: string;
  compact?: boolean; // name, phone, email, service, message
  mini?: boolean; // name, phone, email, service — hero & popup
  dark?: boolean;
  bare?: boolean; // no card chrome (parent provides it)
  button?: string;
  className?: string;
};

/**
 * <x-contact-form>: posts to Laravel's lead API (/api/v1/leads, proxied by next.config rewrites).
 * Validation, spam checks (honeypot + rate limit + optional reCAPTCHA v3) and notifications stay in Laravel.
 */
export function LeadForm({
  title = "Get a free consultation",
  subtitle = "Share a few details — we reply within one business day.",
  service = null,
  location = null,
  formName = "enquiry",
  compact = false,
  mini = false,
  dark = false,
  bare = false,
  button = "Get my free consultation",
  className,
}: Props) {
  const { layout } = useSite();
  const s = layout.settings;
  const isCompact = compact || mini;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const uid = "lf" + useId().replace(/[^a-zA-Z0-9]/g, "");

  const input = cn("form-input pl-11", dark && "form-input-dark");
  const plain = cn("form-input", dark && "form-input-dark");
  const label = mini ? "sr-only" : cn("form-label", dark && "!text-white/80");
  const iconCls = cn("pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2", dark ? "text-white/40" : "text-ink-500/60");
  const chrome = bare
    ? ""
    : dark
      ? "rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl sm:p-7"
      : "rounded-[1.75rem] border border-line bg-white p-6 shadow-[var(--shadow-lift)] sm:p-7";
  const services = s.form_services ?? [];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setErrors({});
    try {
      const body = new FormData(form);
      body.set("source_page", location_href());
      const utm = storage.get("sessionStorage", "ta_utm");
      if (utm) for (const [k, v] of Object.entries(JSON.parse(utm) as Record<string, string>)) body.set(k, v);
      if (window.grecaptcha && s.recaptcha_site_key) {
        const key = s.recaptcha_site_key;
        body.set("g-recaptcha-response", await new Promise<string>((res) => window.grecaptcha!.ready(() => window.grecaptcha!.execute(key, { action: "lead" }).then(res))));
      }
      const resp = await fetch("/api/v1/leads", { method: "POST", headers: { Accept: "application/json" }, body });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        setSuccess(data.message || s.lead_success_message || "Thank you! We'll be in touch shortly.");
        track("generate_lead", { form_name: body.get("form_name") || "enquiry", service: body.get("service") || "" });
        storage.set("localStorage", "ta_enquired", "1");
        form.reset();
      } else if (resp.status === 422) {
        setErrors(Object.fromEntries(Object.entries((data.errors || {}) as Record<string, string[]>).map(([k, v]) => [k, v[0]])));
      } else if (resp.status === 429) {
        setErrors({ form: "Too many attempts. Please wait a minute or call us directly." });
      } else {
        setErrors({ form: "Something went wrong. Please try again or contact us by phone." });
      }
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("w-full", mini ? "max-w-md" : "max-w-xl", chrome, className)}>
      {title && (
        <div className="mb-5 flex items-start gap-3.5">
          <span className="icon-tile icon-grad size-11 shrink-0 rounded-xl">
            <Icon name="message" className="size-5" />
          </span>
          <div className="min-w-0">
            <p className={cn("font-display text-[1.25rem] font-bold leading-tight tracking-[-0.03em]", dark ? "text-white" : "text-ink")}>{title}</p>
            {subtitle && <p className={cn("mt-1 text-[0.85rem]", dark ? "text-white/60" : "text-ink-500")}>{subtitle}</p>}
          </div>
        </div>
      )}

      {success ? (
        <div className={cn("flex flex-col items-center rounded-2xl px-6 py-9 text-center", dark ? "bg-white/5" : "bg-teal-50")} role="status" aria-live="polite">
          <span className="grid size-14 place-items-center rounded-full bg-teal text-white shadow-lg">
            <Icon name="check" className="size-7" />
          </span>
          <p className={cn("mt-4 text-lg font-bold", dark ? "text-white" : "text-ink")}>Message received</p>
          <p className={cn("mt-1 text-sm", dark ? "text-white/70" : "text-ink-600")}>{success}</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className={cn("grid gap-3.5", !mini && "sm:grid-cols-2")}>
          <input type="hidden" name="form_name" value={formName} />
          {location && <input type="hidden" name="location" value={location} />}
          {/* Honeypot — hidden from humans and assistive tech */}
          <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor={`${uid}-fax`}>Fax</label>
            <input id={`${uid}-fax`} type="text" name="fax_number" tabIndex={-1} autoComplete="off" />
          </div>

          <div className={mini ? "grid gap-3.5 sm:grid-cols-2" : "contents"}>
            <Field label="Full name" required htmlFor={`${uid}-name`} labelCls={label} error={errors.name}>
              <Icon name="users" className={iconCls} />
              <input id={`${uid}-name`} name="name" type="text" required maxLength={100} autoComplete="name" placeholder="Your name *" className={cn(input, errors.name && "!border-red-400")} />
            </Field>
            <Field label="Phone" required htmlFor={`${uid}-phone`} labelCls={label} error={errors.phone}>
              <Icon name="phone" className={iconCls} />
              <input id={`${uid}-phone`} name="phone" type="tel" required maxLength={20} autoComplete="tel" inputMode="tel" placeholder="Phone number *" className={cn(input, errors.phone && "!border-red-400")} />
            </Field>
          </div>
          <Field label="Email" htmlFor={`${uid}-email`} labelCls={label} error={errors.email}>
            <Icon name="mail" className={iconCls} />
            <input id={`${uid}-email`} name="email" type="email" maxLength={150} autoComplete="email" placeholder="Email address" className={input} />
          </Field>
          <Field label="Service" htmlFor={`${uid}-service`} labelCls={label}>
            <Icon name="layers" className={iconCls} />
            <select id={`${uid}-service`} name="service" className={input} defaultValue={service ?? ""}>
              <option value="">What do you need help with?</option>
              {services.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              {service && !services.includes(service) && <option value={service}>{service}</option>}
              <option value="Other">Something else</option>
            </select>
          </Field>
          {!isCompact && (
            <>
              <Field label="Company" htmlFor={`${uid}-company`} labelCls={label}>
                <Icon name="building" className={iconCls} />
                <input id={`${uid}-company`} name="company" type="text" maxLength={150} autoComplete="organization" placeholder="Company name" className={input} />
              </Field>
              <Field label="Budget" htmlFor={`${uid}-budget`} labelCls={label}>
                <Icon name="banknote" className={iconCls} />
                <select id={`${uid}-budget`} name="budget" className={input} defaultValue="">
                  <option value="">Budget (optional)</option>
                  {lines(s.budget_options).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
          {!mini && (
            <div className="sm:col-span-2">
              <label htmlFor={`${uid}-message`} className={label}>
                How can we help?
              </label>
              <textarea id={`${uid}-message`} name="message" rows={3} maxLength={3000} className={cn(plain, "resize-none")} placeholder="A line or two about your goals and timeline" />
            </div>
          )}

          <div className={mini ? "" : "sm:col-span-2"}>
            {errors.form && (
              <p className="form-error mb-3" role="alert">
                {errors.form}
              </p>
            )}
            <button type="submit" className="btn btn-primary btn-lg group w-full" disabled={loading}>
              {loading ? (
                <span className="relative flex items-center gap-2">
                  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>{" "}
                  Sending…
                </span>
              ) : (
                <>
                  <span className="relative">{button}</span>
                  <Icon name="arrow-right" className="relative size-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>
            <p className={cn("mt-3 flex items-center justify-center gap-1.5 text-xs", dark ? "text-white/50" : "text-ink-500")}>
              <Icon name="shield" className="size-3.5" /> 100% confidential · No spam, ever
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

function location_href() {
  return typeof window === "undefined" ? "" : window.location.href;
}

function Field({ label, required, htmlFor, labelCls, error, children }: { label: string; required?: boolean; htmlFor: string; labelCls: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label} {required && <span className="text-brand">*</span>}
      </label>
      <div className="relative">{children}</div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
