import { useState } from "react";
import { SEO } from "../components/SEO";
import { Mail, Send, Phone, MapPin } from "lucide-react";
import { useSiteSettings } from "../contexts/SiteSettingsContext";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { contactEmail, contactPhone, contactAddress, contactSuccessMessage } = useSiteSettings();
  const hasContactInfo = contactEmail?.trim() || contactPhone?.trim() || contactAddress?.trim();
  const successMessage = contactSuccessMessage?.trim() || "Thanks for reaching out. We'll get back to you soon.";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();
    if (!name || !email || !message) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setSubmitError(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <SEO
        title="Contact"
        description="Get in touch with the Lumina team. We'd love to hear from you."
      />
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
        Contact Us
      </h1>
      <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-12">
        Have a question or want to work together? Send us a message.
      </p>

      {submitted ? (
        <div className="rounded-2xl border p-8 text-center badge-primary" style={{ borderColor: "var(--site-primary)", backgroundColor: "var(--site-primary-muted)" }}>
          <p className="font-medium" style={{ color: "var(--site-primary)" }}>
            {successMessage}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
              {submitError}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus-ring-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus-ring-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus-ring-primary transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary inline-flex items-center space-x-2 rounded-full px-8 py-4 font-semibold disabled:opacity-70"
          >
            <Send size={18} />
            <span>{submitting ? "Sending…" : "Send message"}</span>
          </button>
        </form>
      )}

      {hasContactInfo && (
        <div className="mt-12 space-y-4 text-zinc-600 dark:text-zinc-400">
          {contactEmail?.trim() && (
            <div className="flex items-center space-x-4">
              <Mail size={20} className="shrink-0" />
              <a href={`mailto:${contactEmail.trim()}`} className="link-primary">
                {contactEmail.trim()}
              </a>
            </div>
          )}
          {contactPhone?.trim() && (
            <div className="flex items-center space-x-4">
              <Phone size={20} className="shrink-0" />
              <a href={`tel:${contactPhone.trim().replace(/\s/g, "")}`} className="link-primary">
                {contactPhone.trim()}
              </a>
            </div>
          )}
          {contactAddress?.trim() && (
            <div className="flex items-start space-x-4">
              <MapPin size={20} className="shrink-0 mt-0.5" />
              <span className="whitespace-pre-line">{contactAddress.trim()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
