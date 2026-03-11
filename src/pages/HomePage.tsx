import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Post } from "../types";
import { BlogCard } from "../components/BlogCard";
import { SEO } from "../components/SEO";
import { ArrowRight, Mail } from "lucide-react";
import { motion } from "motion/react";

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-24 pb-24">
      <SEO 
        title="Modern Blog for Startups" 
        description="Lumina is a high-performance, SEO-optimized blog platform designed for modern startups and tech writers."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-900 py-24 sm:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.2),_transparent_50%)]"></div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-8">
              Insights for the <span className="text-emerald-400">Modern Builder</span>.
            </h1>
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
              Deep dives into technology, design, and startup growth. 
              Written by experts, designed for readers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/blog"
                className="rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
              >
                Start Reading
              </Link>
              <Link
                to="/about"
                className="rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Latest Posts */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 mb-4">Latest Articles</h2>
            <p className="text-zinc-600">Fresh perspectives from our team of writers.</p>
          </div>
          <Link to="/blog" className="hidden sm:flex items-center space-x-2 text-emerald-600 font-semibold hover:text-emerald-500 transition-colors">
            <span>View all posts</span>
            <ArrowRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="aspect-video bg-zinc-100 rounded-2xl"></div>
                <div className="h-6 bg-zinc-100 rounded w-3/4"></div>
                <div className="h-4 bg-zinc-100 rounded w-full"></div>
                <div className="h-4 bg-zinc-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.slice(0, 6).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-emerald-600 px-8 py-16 sm:px-16 sm:py-24 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <Mail className="mx-auto text-emerald-200 mb-6" size={48} />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
              Subscribe to our newsletter
            </h2>
            <p className="text-emerald-100 text-lg mb-10">
              Get the latest insights, tutorials, and updates delivered straight to your inbox. 
              No spam, ever.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-full border-0 px-6 py-4 text-zinc-900 focus:ring-2 focus:ring-emerald-400 outline-none"
                required
              />
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-8 py-4 font-semibold text-white hover:bg-zinc-800 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
