import { useEffect, useState } from "react";
import { Post } from "../types";
import { BlogCard } from "../components/BlogCard";
import { SEO } from "../components/SEO";
import { Search, Filter } from "lucide-react";

export function BlogListingPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <SEO 
        title="Blog" 
        description="Explore our latest articles, tutorials, and insights on technology, design, and growth."
      />

      <header className="mb-16">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 mb-8">
          The Journal
        </h1>
        <p className="text-xl text-zinc-600 max-w-2xl leading-relaxed">
          A collection of thoughts, learnings, and perspectives from our team. 
          We write about the things we're passionate about.
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
            className="w-full rounded-full border border-zinc-200 bg-white py-3 pl-12 pr-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        
        <div className="flex items-center space-x-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-zinc-100 text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors">
            <Filter size={16} />
            <span>All Categories</span>
          </button>
          <button className="px-4 py-2 rounded-full border border-zinc-200 text-zinc-600 text-sm font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors whitespace-nowrap">
            Technology
          </button>
          <button className="px-4 py-2 rounded-full border border-zinc-200 text-zinc-600 text-sm font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors whitespace-nowrap">
            Design
          </button>
          <button className="px-4 py-2 rounded-full border border-zinc-200 text-zinc-600 text-sm font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors whitespace-nowrap">
            Growth
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-video bg-zinc-100 rounded-2xl"></div>
              <div className="h-6 bg-zinc-100 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-zinc-50 rounded-3xl">
              <p className="text-xl text-zinc-500">No articles found matching your search.</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-4 text-emerald-600 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
