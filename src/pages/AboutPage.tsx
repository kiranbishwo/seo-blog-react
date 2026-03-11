import { SEO } from "../components/SEO";

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <SEO
        title="About Us"
        description="Lumina is a high-performance, SEO-optimized blog platform for modern startups and tech writers."
      />
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
        About Lumina
      </h1>
      <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none">
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          Lumina is a professional blog platform built for startups and teams who care about
          performance, SEO, and reader experience. We believe in clean design, fast loading,
          and content that matters.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
          Our mission is to give writers and companies a simple, powerful way to publish
          articles that rank well and are a pleasure to read—on any device, in any context.
        </p>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Whether you&apos;re sharing product updates, technical deep dives, or thought
          leadership, Lumina helps you reach your audience with a minimal, accessible, and
          SEO-friendly frontend.
        </p>
      </div>
    </div>
  );
}
