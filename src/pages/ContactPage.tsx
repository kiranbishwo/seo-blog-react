import { useState } from "react";
import { SEO } from "../components/SEO";
import { Mail, Send } from "lucide-react";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
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
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-8 text-center">
          <p className="text-emerald-800 dark:text-emerald-200 font-medium">
            Thanks for reaching out. We&apos;ll get back to you soon.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
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
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
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
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center space-x-2 rounded-full bg-emerald-600 px-8 py-4 font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            <Send size={18} />
            <span>Send message</span>
          </button>
        </form>
      )}

      <div className="mt-12 flex items-center space-x-4 text-zinc-600 dark:text-zinc-400">
        <Mail size={20} />
        <a href="mailto:hello@lumina.blog" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
          hello@lumina.blog
        </a>
      </div>
    </div>
  );
}
