import { useEffect, useState } from "react";
import { BarChart3, Globe, Mail, FileText, Share2, Loader2, Phone } from "lucide-react";

const fetchOpts: RequestInit = { credentials: "include" };

interface SiteSettings {
  project_name?: string;
  primary_color?: string;
  secondary_color?: string;
  footer_copyright?: string;
  google_analytics_script?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  contact_success_message?: string;
}

interface SocialLink {
  id?: number;
  platform: string;
  url: string;
  sort_order?: number;
}

interface LegalPage {
  id?: number;
  slug: string;
  title: string;
  content: string;
}

interface SmtpSettings {
  host: string;
  port: number;
  secure: number;
  user: string;
  password?: string;
  from_email: string;
  from_name: string;
}

const SOCIAL_PLATFORMS = ["twitter", "github", "facebook", "linkedin", "youtube", "instagram"];

type TabId = "general" | "analytics" | "email" | "legal" | "social" | "contact";

export function AdminSettingsPage() {
  const [tab, setTab] = useState<TabId>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [site, setSite] = useState<SiteSettings>({
    project_name: "Lumina",
    primary_color: "#059669",
    secondary_color: "#10b981",
    footer_copyright: "",
    google_analytics_script: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    contact_success_message: "Thanks for reaching out. We'll get back to you soon.",
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [legalPages, setLegalPages] = useState<LegalPage[]>([]);
  const [smtp, setSmtp] = useState<SmtpSettings>({
    host: "",
    port: 587,
    secure: 0,
    user: "",
    password: "",
    from_email: "",
    from_name: "",
  });

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/settings", fetchOpts)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Not authenticated" : res.status === 403 ? "Forbidden" : `HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.site) {
          setSite({
            project_name: data.site.project_name ?? "Lumina",
            primary_color: data.site.primary_color ?? "#059669",
            secondary_color: data.site.secondary_color ?? "#10b981",
            footer_copyright: data.site.footer_copyright ?? "",
            google_analytics_script: data.site.google_analytics_script ?? "",
            contact_email: data.site.contact_email ?? "",
            contact_phone: data.site.contact_phone ?? "",
            contact_address: data.site.contact_address ?? "",
            contact_success_message: data.site.contact_success_message ?? "Thanks for reaching out. We'll get back to you soon.",
          });
        }
        if (Array.isArray(data.social)) setSocialLinks(data.social);
        if (Array.isArray(data.legal)) setLegalPages(data.legal);
        if (data.smtp) {
          setSmtp({
            host: data.smtp.host ?? "",
            port: data.smtp.port ?? 587,
            secure: data.smtp.secure ?? 0,
            user: data.smtp.user ?? "",
            password: "",
            from_email: data.smtp.from_email ?? "",
            from_name: data.smtp.from_name ?? "",
          });
        }
      })
      .catch((err) => setError(err?.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const saveSite = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/settings/site", {
      ...fetchOpts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: site.project_name,
        primaryColor: site.primary_color,
        secondaryColor: site.secondary_color,
        footerCopyright: site.footer_copyright,
        googleAnalyticsScript: site.google_analytics_script ?? "",
        contactEmail: site.contact_email ?? "",
        contactPhone: site.contact_phone ?? "",
        contactAddress: site.contact_address ?? "",
        contactSuccessMessage: site.contact_success_message ?? "",
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage("Site settings saved.");
      if (tab === "analytics") setMessage("Analytics script saved.");
    } else {
      setError(body?.error || "Failed to save");
    }
    setSaving(false);
  };

  const saveAnalytics = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/settings/site", {
      ...fetchOpts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectName: site.project_name,
        primaryColor: site.primary_color,
        secondaryColor: site.secondary_color,
        footerCopyright: site.footer_copyright,
        googleAnalyticsScript: site.google_analytics_script,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setMessage("Analytics script saved.");
    else setError(body?.error || "Failed to save");
    setSaving(false);
  };

  const saveSmtp = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/settings/smtp", {
      ...fetchOpts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        user: smtp.user,
        password: smtp.password || undefined,
        from_email: smtp.from_email,
        from_name: smtp.from_name,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setMessage("SMTP settings saved.");
    else setError(body?.error || "Failed to save");
    setSaving(false);
  };

  const testSmtp = async () => {
    setTestEmailLoading(true);
    setError(null);
    setMessage(null);
    const body = testEmailTo.trim() ? { to: testEmailTo.trim() } : {};
    const res = await fetch("/api/admin/settings/smtp/test", {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMessage(data.message || "Test email sent.");
    } else {
      setError(data?.error || "Test failed");
    }
    setTestEmailLoading(false);
  };

  const saveLegal = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/settings/legal", {
      ...fetchOpts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pages: legalPages.map((p) => ({ slug: p.slug, title: p.title, content: p.content })),
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setMessage("Legal pages saved.");
    else setError(body?.error || "Failed to save");
    setSaving(false);
  };

  const saveSocial = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/settings/social", {
      ...fetchOpts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        links: socialLinks.map((l, i) => ({ platform: l.platform, url: l.url, sortOrder: i })),
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) setMessage("Social links saved.");
    else setError(body?.error || "Failed to save");
    setSaving(false);
  };

  const addSocialRow = () => {
    const next = SOCIAL_PLATFORMS.find((p) => !socialLinks.some((l) => l.platform === p)) || "other";
    setSocialLinks([...socialLinks, { platform: next, url: "" }]);
  };

  const removeSocialRow = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const tabs: { id: TabId; label: string; icon: typeof Globe }[] = [
    { id: "general", label: "General", icon: Globe },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "email", label: "Email (SMTP)", icon: Mail },
    { id: "contact", label: "Contact info", icon: Phone },
    { id: "legal", label: "Legal", icon: FileText },
    { id: "social", label: "Social links", icon: Share2 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Advanced Settings</h1>
        <p className="text-zinc-500 text-sm">Project branding, analytics, email, legal pages, and social links.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg px-4 py-3 text-sm badge-primary border" style={{ borderColor: "var(--site-primary)" }}>
          {message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? "bg-[var(--site-primary)] text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            <t.icon size={18} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-zinc-900">General</h3>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Project name</label>
            <input
              type="text"
              value={site.project_name ?? ""}
              onChange={(e) => setSite((s) => ({ ...s, project_name: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              placeholder="Lumina"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Primary color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={site.primary_color ?? "#059669"}
                  onChange={(e) => setSite((s) => ({ ...s, primary_color: e.target.value }))}
                  className="h-10 w-14 rounded border border-zinc-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={site.primary_color ?? ""}
                  onChange={(e) => setSite((s) => ({ ...s, primary_color: e.target.value }))}
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Secondary color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={site.secondary_color ?? "#10b981"}
                  onChange={(e) => setSite((s) => ({ ...s, secondary_color: e.target.value }))}
                  className="h-10 w-14 rounded border border-zinc-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={site.secondary_color ?? ""}
                  onChange={(e) => setSite((s) => ({ ...s, secondary_color: e.target.value }))}
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 font-mono text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Footer copyright</label>
            <input
              type="text"
              value={site.footer_copyright ?? ""}
              onChange={(e) => setSite((s) => ({ ...s, footer_copyright: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              placeholder="© 2025 Your Blog. All rights reserved."
            />
          </div>
          <button
            type="button"
            onClick={saveSite}
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save general
          </button>
        </div>
      )}

      {tab === "analytics" && (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-zinc-900">Google Analytics</h3>
          <p className="text-sm text-zinc-500">Paste your Google Analytics script (e.g. gtag or GA4 snippet). It will be injected into the site.</p>
          <textarea
            value={site.google_analytics_script ?? ""}
            onChange={(e) => setSite((s) => ({ ...s, google_analytics_script: e.target.value }))}
            rows={8}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 font-mono text-sm"
            placeholder={'<script async src="https://..."></script>'}
          />
          <button
            type="button"
            onClick={saveAnalytics}
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save analytics
          </button>
        </div>
      )}

      {tab === "email" && (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-zinc-900">SMTP Email</h3>
          <p className="text-sm text-zinc-500">Configure SMTP for sending emails. Use the Test email button to send a test to the address below or your account email.</p>
          <p className="text-xs text-zinc-500 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2">If you get <strong>535 Authentication Failed</strong>: use the full email as User; for Gmail, turn on 2-Step Verification and create an <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline">App Password</a>, then use that as Password.</p>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Send test email to</label>
            <input
              type="email"
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 max-w-md"
              placeholder="Leave blank to use your account email"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Host</label>
              <input
                type="text"
                value={smtp.host}
                onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
                placeholder="smtp.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Port</label>
              <input
                type="number"
                value={smtp.port}
                onChange={(e) => setSmtp((s) => ({ ...s, port: parseInt(e.target.value, 10) || 587 }))}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="smtp-secure"
              checked={smtp.secure === 1}
              onChange={(e) => setSmtp((s) => ({ ...s, secure: e.target.checked ? 1 : 0 }))}
              className="rounded border-zinc-300"
            />
            <label htmlFor="smtp-secure" className="text-sm text-zinc-700">Use TLS (secure)</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">User</label>
            <input
              type="text"
              value={smtp.user}
              onChange={(e) => setSmtp((s) => ({ ...s, user: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
            <input
              type="password"
              value={smtp.password ?? ""}
              onChange={(e) => setSmtp((s) => ({ ...s, password: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              placeholder="Leave blank to keep existing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">From email</label>
            <input
              type="text"
              value={smtp.from_email}
              onChange={(e) => setSmtp((s) => ({ ...s, from_email: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              placeholder="noreply@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">From name</label>
            <input
              type="text"
              value={smtp.from_name}
              onChange={(e) => setSmtp((s) => ({ ...s, from_name: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              placeholder="Your Blog"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveSmtp}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save SMTP
            </button>
            <button
              type="button"
              onClick={testSmtp}
              disabled={testEmailLoading}
              className="flex items-center gap-2 border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-50 font-medium disabled:opacity-50"
            >
              {testEmailLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Test email
            </button>
          </div>
        </div>
      )}

      {tab === "contact" && (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-zinc-900">Contact info</h3>
          <p className="text-sm text-zinc-500">This information is shown on the Contact Us page.</p>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Contact email</label>
            <input
              type="email"
              value={site.contact_email ?? ""}
              onChange={(e) => setSite((s) => ({ ...s, contact_email: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Contact phone</label>
            <input
              type="tel"
              value={site.contact_phone ?? ""}
              onChange={(e) => setSite((s) => ({ ...s, contact_phone: e.target.value }))}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900"
              placeholder="+1 234 567 8900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Contact address</label>
            <textarea
              value={site.contact_address ?? ""}
              onChange={(e) => setSite((s) => ({ ...s, contact_address: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 text-sm"
              placeholder="Street, City, Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Success message (after form submit)</label>
            <textarea
              value={site.contact_success_message ?? ""}
              onChange={(e) => setSite((s) => ({ ...s, contact_success_message: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 text-sm"
              placeholder="Thanks for reaching out. We'll get back to you soon."
            />
            <p className="text-xs text-zinc-500 mt-1">Shown to visitors after they submit the contact form.</p>
          </div>
          <button
            type="button"
            onClick={saveSite}
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save contact info
          </button>
        </div>
      )}

      {tab === "legal" && (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-6 max-w-4xl">
          <h3 className="font-bold text-zinc-900">Legal pages</h3>
          <p className="text-sm text-zinc-500">Terms of Service, Privacy Policy, and Cookie Policy. Content is shown on /legal/terms, /legal/privacy, /legal/cookies.</p>
          {legalPages.map((page, idx) => (
            <div key={page.slug} className="border border-zinc-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-zinc-900">{page.title}</span>
                <span className="text-xs text-zinc-500">/legal/{page.slug}</span>
              </div>
              <input
                type="text"
                value={page.title}
                onChange={(e) =>
                  setLegalPages((prev) => prev.map((p, i) => (i === idx ? { ...p, title: e.target.value } : p)))
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 text-sm"
                placeholder="Title"
              />
              <textarea
                value={page.content}
                onChange={(e) =>
                  setLegalPages((prev) => prev.map((p, i) => (i === idx ? { ...p, content: e.target.value } : p)))
                }
                rows={6}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 text-sm"
                placeholder="HTML content"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={saveLegal}
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save legal pages
          </button>
        </div>
      )}

      {tab === "social" && (
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-zinc-900">Social links</h3>
          <p className="text-sm text-zinc-500">URLs for social platforms. These appear in the footer.</p>
          <div className="space-y-3">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  value={link.platform}
                  onChange={(e) =>
                    setSocialLinks((prev) => prev.map((l, i) => (i === index ? { ...l, platform: e.target.value } : l)))
                  }
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 w-32 text-sm"
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="other">other</option>
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) =>
                    setSocialLinks((prev) => prev.map((l, i) => (i === index ? { ...l, url: e.target.value } : l)))
                  }
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 text-sm"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => removeSocialRow(index)}
                  className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addSocialRow}
              className="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-50 text-sm font-medium"
            >
              Add link
            </button>
            <button
              type="button"
              onClick={saveSocial}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save social links
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
