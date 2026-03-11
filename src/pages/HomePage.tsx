import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Post } from "../types";
import { Category } from "../types";
import { BlogCard } from "../components/BlogCard";
import { SEO } from "../components/SEO";
import {
  ArrowRight,
  Mail,
  TrendingUp,
  FolderTree,
  Zap,
  PenLine,
  Search,
  BookOpen,
  Quote,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/posts").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData);
        setCategories(categoriesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredPost = posts[0];
  const latestPosts = featuredPost ? posts.slice(1, 7) : posts.slice(0, 6);
  const popularPosts = posts.slice(0, 3);

  return (
    <div className="space-y-0 pb-24">
      <SEO
        title="Modern Blog for Startups"
        description="Lumina is a high-performance, SEO-optimized blog platform designed for modern startups and tech writers."
        canonical={typeof window !== "undefined" ? window.location.origin + "/" : undefined}
      />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden bg-zinc-900 py-20 sm:py-28">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[var(--site-gradient-radial)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm mb-8" style={{ color: "color-mix(in srgb, var(--site-primary) 80%, white)" }}>
              <Sparkles size={16} />
              Built for builders and thinkers
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl mb-8 leading-[1.1]">
              Insights for the{" "}
              <span className="text-transparent bg-clip-text bg-[var(--site-gradient)]">
                Modern Builder
              </span>
              .
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-400 mb-12 leading-relaxed max-w-2xl">
              Deep dives into technology, design, and startup growth. Written by experts, designed for readers who build.
            </p>
            <div className="flex flex-wrap gap-4 mb-16">
              <Link
                to="/blog"
                className="btn-primary group inline-flex items-center rounded-full px-8 py-4 text-lg font-semibold hover:scale-[1.02]"
              >
                Start Reading
                <ArrowRight className="inline-block ml-2 -translate-x-0 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="/about"
                className="rounded-full bg-white/10 border border-white/20 px-8 py-4 text-lg font-semibold text-white hover:bg-white/15 transition-all backdrop-blur-sm"
              >
                Our Story
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-500"
            >
              <span>{posts.length > 0 ? `${posts.length}+` : "Fresh"} articles</span>
              <span>{categories.length} categories</span>
              <span>Weekly updates</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Read Lumina */}
      <section className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl mb-4">
              Why read with us
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              We focus on quality, clarity, and depth so you can stay ahead.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Fast & focused", desc: "No fluff. Get to the point and apply what you learn." },
              { icon: PenLine, title: "Expert writers", desc: "Real practitioners sharing real experience." },
              { icon: Search, title: "SEO-smart", desc: "Content built to be found and shared." },
              { icon: BookOpen, title: "Easy to browse", desc: "Categories and search that actually work." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 p-8 shadow-sm hover:shadow-md hover:border-[var(--site-primary)]/30 transition-all"
              >
                <div className="rounded-xl bg-[var(--site-primary-muted)] w-12 h-12 flex items-center justify-center mb-6 text-[var(--site-primary)]">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{item.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post (large card) */}
      {!loading && featuredPost && (
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium text-[var(--site-primary)] uppercase tracking-wider mb-6"
            >
              Featured article
            </motion.p>
            <Link to={`/blog/${featuredPost.slug}`} className="group block">
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="aspect-video lg:aspect-auto lg:min-h-[400px] bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <img
                      src={featuredPost.featured_image || "https://picsum.photos/seed/feature/1200/630"}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-10 sm:p-12 lg:p-16 flex flex-col justify-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4 group-hover:text-[var(--site-primary)] transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[var(--site-primary)] font-semibold">
                      Read article
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.article>
            </Link>
          </div>
        </section>
      )}

      {/* Latest Articles */}
      <section className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
                Latest Articles
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg">
                Fresh perspectives from our team of writers.
              </p>
            </div>
            <Link
              to="/blog"
              className="link-primary inline-flex items-center gap-2 font-semibold shrink-0"
            >
              View all posts
              <ArrowRight size={20} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-video bg-zinc-200 dark:bg-zinc-700 rounded-2xl" />
                  <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {latestPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.06, 0.3) }}
                >
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular reads */}
      {!loading && popularPosts.length > 0 && (
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[var(--site-primary-muted)] p-2.5">
                  <TrendingUp size={28} className="text-[var(--site-primary)]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Popular reads
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">Most read and shared.</p>
                </div>
              </div>
              <Link
                to="/blog"
className="link-primary inline-flex items-center gap-2 font-semibold shrink-0"
            >
              View all
                <ArrowRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {popularPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {!loading && categories.length > 0 && (
        <section className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-14">
              <div className="rounded-xl bg-[var(--site-primary-muted)] p-2.5">
                <FolderTree size={28} className="text-[var(--site-primary)]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Browse by category
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">Find articles by topic.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 px-8 py-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:border-[var(--site-primary)] hover:text-[var(--site-primary)] hover:shadow-lg transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quote / testimonial strip */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="mx-auto mb-8 opacity-40" size={48} style={{ color: "var(--site-primary)" }} />
          <blockquote className="text-2xl sm:text-3xl font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed mb-8">
            “Great content is the best growth tool. We build ours to be clear, useful, and easy to find.”
          </blockquote>
          <p className="text-zinc-500 dark:text-zinc-400">— The Lumina team</p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl px-8 py-20 sm:px-16 sm:py-28 text-center relative overflow-hidden" style={{ background: "linear-gradient(to bottom right, var(--site-primary), var(--site-secondary))" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20" style={{ backgroundColor: "var(--site-primary)" }} />
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-8">
                <Mail className="text-white" size={32} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                Subscribe to our newsletter
              </h2>
              <p className="text-white/90 text-lg mb-10 leading-relaxed">
                Get the latest insights, tutorials, and updates delivered straight to your inbox. No spam, ever.
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full min-w-0 flex-1 rounded-full bg-white border border-transparent px-6 py-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-zinc-900 px-8 py-4 font-semibold text-white hover:bg-zinc-800 transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 bg-zinc-900 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
            Ready to explore?
          </h2>
          <p className="text-zinc-400 text-lg mb-10">
            Browse all articles and find what matters to you.
          </p>
          <Link
            to="/blog"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-10 py-4 text-lg font-semibold"
          >
            Browse all articles
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
