import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Post } from "../types";
import { Category } from "../types";
import { Tag } from "../types";
import { BlogCard } from "../components/BlogCard";
import { SEO } from "../components/SEO";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const POSTS_PER_PAGE = 9;

export function BlogListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") ?? "";
  const tagSlug = searchParams.get("tag") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (tagSlug) params.set("tag", tagSlug);
    const query = params.toString();
    Promise.all([
      fetch(`/api/posts${query ? `?${query}` : ""}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ])
      .then(([postsData, categoriesData, tagsData]) => {
        setPosts(postsData);
        setCategories(categoriesData);
        setTags(tagsData);
      })
      .finally(() => setLoading(false));
  }, [categorySlug, tagSlug]);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const currentPage = Math.min(page, totalPages || 1);
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(start, start + POSTS_PER_PAGE);

  const setFilter = (key: "category" | "tag", value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    if (p > 1) next.set("page", String(p));
    else next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <SEO
        title="Blog"
        description="Explore our latest articles, tutorials, and insights on technology, design, and growth."
        canonical={typeof window !== "undefined" ? `${window.location.origin}/blog` : undefined}
      />

      <header className="mb-16">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
          The Journal
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          A collection of thoughts, learnings, and perspectives from our team. We write about the
          things we&apos;re passionate about.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 mb-16 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-3 pl-12 pr-6 text-zinc-900 dark:text-zinc-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Filter size={16} />
            Category
          </span>
          <button
            onClick={() => setFilter("category", "")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              !categorySlug
                ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter("category", categorySlug === cat.slug ? "" : cat.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                categorySlug === cat.slug
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-12">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Tags:</span>
          <button
            onClick={() => setFilter("tag", "")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !tagSlug
                ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600"
            }`}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter("tag", tagSlug === t.slug ? "" : t.slug)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tagSlug === t.slug
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600"
              }`}
            >
              #{t.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
              <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {paginatedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-800/30 rounded-3xl">
          <p className="text-xl text-zinc-500 dark:text-zinc-400">
            No articles found matching your search or filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchParams({});
            }}
            className="mt-4 text-emerald-600 font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
