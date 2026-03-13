import { createContext, useContext, useEffect, useState, useRef } from "react";

export interface SiteSettings {
  projectName: string;
  primaryColor: string;
  secondaryColor: string;
  footerCopyright: string;
  googleAnalyticsScript: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactSuccessMessage: string;
  socialLinks: { platform: string; url: string }[];
  legalPages: { slug: string; title: string; path: string }[];
}

const defaultSettings: SiteSettings = {
  projectName: "Lumina",
  primaryColor: "#059669",
  secondaryColor: "#10b981",
  footerCopyright: "",
  googleAnalyticsScript: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  contactSuccessMessage: "Thanks for reaching out. We'll get back to you soon.",
  socialLinks: [],
  legalPages: [],
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const gaInjected = useRef(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((data) => {
        setSettings({
          projectName: data.projectName ?? defaultSettings.projectName,
          primaryColor: data.primaryColor ?? defaultSettings.primaryColor,
          secondaryColor: data.secondaryColor ?? defaultSettings.secondaryColor,
          footerCopyright: data.footerCopyright ?? "",
          googleAnalyticsScript: data.googleAnalyticsScript ?? "",
          contactEmail: data.contactEmail ?? "",
          contactPhone: data.contactPhone ?? "",
          contactAddress: data.contactAddress ?? "",
          contactSuccessMessage: data.contactSuccessMessage ?? defaultSettings.contactSuccessMessage,
          socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
          legalPages: Array.isArray(data.legalPages) ? data.legalPages : [],
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.style.setProperty("--site-primary", settings.primaryColor);
    document.documentElement.style.setProperty("--site-secondary", settings.secondaryColor);
  }, [loaded, settings.primaryColor, settings.secondaryColor]);

  useEffect(() => {
    if (!loaded || !settings.googleAnalyticsScript?.trim() || gaInjected.current) return;
    const headHasGa = Array.from(document.head.querySelectorAll("script")).some(
      (s) => (s.src && (s.src.includes("googletagmanager.com") || s.src.includes("gtag"))) || s.textContent?.includes("googletagmanager.com")
    );
    if (headHasGa) {
      gaInjected.current = true;
      return;
    }
    gaInjected.current = true;
    const container = document.createElement("div");
    container.innerHTML = settings.googleAnalyticsScript.trim();
    const scripts = container.querySelectorAll("script");
    scripts.forEach((script) => {
      const el = document.createElement("script");
      if (script.src) el.src = script.src;
      if (script.async) el.async = true;
      if (script.defer) el.defer = true;
      if (script.innerHTML) el.textContent = script.innerHTML;
      document.head.appendChild(el);
    });
  }, [loaded, settings.googleAnalyticsScript]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
