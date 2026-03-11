import { Link, NavLink } from "react-router-dom";
import { Menu, X, Search, Github, Twitter } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">Lumina</span>
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
                      "text-sm font-medium transition-colors hover:text-emerald-600",
                      isActive ? "text-emerald-600" : "text-zinc-600"
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-zinc-500 hover:text-emerald-600 transition-colors">
              <Search size={20} />
            </button>
            <Link
              to="/admin"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Admin
            </Link>
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
        <div className="md:hidden bg-white border-b border-zinc-100">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-medium text-emerald-600"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-zinc-50 border-t border-zinc-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">Lumina</span>
            </Link>
            <p className="text-zinc-600 max-w-sm mb-6 leading-relaxed">
              A professional blog platform for modern startups. Share your stories, 
              insights, and updates with a clean, SEO-optimized experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-emerald-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-zinc-400 hover:text-emerald-600 transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-6">Platform</h3>
            <ul className="space-y-4">
              <li><Link to="/blog" className="text-zinc-600 hover:text-emerald-600 transition-colors">Blog</Link></li>
              <li><Link to="/about" className="text-zinc-600 hover:text-emerald-600 transition-colors">About</Link></li>
              <li><Link to="/contact" className="text-zinc-600 hover:text-emerald-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-zinc-600 hover:text-emerald-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-emerald-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-zinc-600 hover:text-emerald-600 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-200 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Lumina Blog. All rights reserved.
          </p>
          <p className="text-sm text-zinc-400">
            Designed for high performance and SEO.
          </p>
        </div>
      </div>
    </footer>
  );
}
