import { Link, NavLink } from "react-router-dom";
import { Menu, X, Search, Github, Twitter, Linkedin, Youtube, Instagram, Sun, Moon, Share2 } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { useTheme } from "../hooks/useTheme";
import { useSiteSettings } from "../contexts/SiteSettingsContext";
import { SearchModal } from "./SearchModal";

const socialIcons: Record<string, typeof Twitter> = {
  twitter: Twitter,
  github: Github,
  facebook: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  instagram: Instagram,
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { projectName, primaryColor } = useSiteSettings();

  const openSearch = () => {
    setIsSearchOpen(true);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold text-xl">{(projectName || "L")[0]}</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{projectName || "Lumina"}</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      "text-sm font-medium transition-colors",
                      isActive ? "text-[var(--site-primary)]" : "text-zinc-600 dark:text-zinc-400 hover:text-[var(--site-primary)]"
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 text-zinc-500 hover:text-[var(--site-primary)] transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-zinc-500 hover:text-[var(--site-primary)] transition-colors rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Search posts"
            >
              <Search size={20} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-500 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-[var(--site-primary)]"
              >
                {link.name}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
              className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button
              type="button"
              onClick={openSearch}
              className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-base font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-[var(--site-primary)]"
            >
              <Search size={20} />
              Search
            </button>
          </div>
        </div>
      )}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}

export function Footer() {
  const { projectName, primaryColor, footerCopyright, socialLinks, legalPages } = useSiteSettings();
  const initial = (projectName || "L")[0];

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-white font-bold text-xl">{initial}</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{projectName || "Lumina"}</span>
            </Link>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
              A professional blog platform for modern startups. Share your stories,
              insights, and updates with a clean, SEO-optimized experience.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => {
                const Icon = socialIcons[link.platform.toLowerCase()] || Share2;
                return (
                  <a
                    key={link.platform + link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-[var(--site-primary)] transition-colors"
                    aria-label={link.platform}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link to="/blog" className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--site-primary)] transition-colors">Blog</Link></li>
              <li><Link to="/about" className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--site-primary)] transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--site-primary)] transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-6">Legal</h3>
            <ul className="space-y-4">
              {legalPages.length > 0
                ? legalPages.map((page) => (
                    <li key={page.slug}>
                      <Link to={page.path} className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--site-primary)] transition-colors">
                        {page.title}
                      </Link>
                    </li>
                  ))
                : (
                  <>
                    <li><Link to="/legal/privacy" className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--site-primary)] transition-colors">Privacy Policy</Link></li>
                    <li><Link to="/legal/terms" className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--site-primary)] transition-colors">Terms of Service</Link></li>
                    <li><Link to="/legal/cookies" className="text-zinc-600 dark:text-zinc-400 hover:text-[var(--site-primary)] transition-colors">Cookie Policy</Link></li>
                  </>
                )}
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {footerCopyright?.trim() || `© ${new Date().getFullYear()} ${projectName || "Lumina"}. All rights reserved.`}
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Designed for high performance and SEO.
          </p>
        </div>
      </div>
    </footer>
  );
}
