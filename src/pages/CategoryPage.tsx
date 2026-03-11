import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Post } from "../types";
import { BlogCard } from "../components/BlogCard";
import { SEO } from "../components/SEO";

interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/api/categories/${slug}`).then((r) => r.json()),
      fetch(`/api/posts?category=${slug}`).then((r) => r.json()),
    ])
      .then(([cat, list]) => {
        if (cat.error) {
          setCategory(null);
          setPosts([]);
        } else {
          setCategory(cat);
          setPosts(list);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-zinc-100 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-video bg-zinc-100 rounded-2xl" />
                <div className="h-6 bg-zinc-100 rounded w-3/4" />
                <div className="h-4 bg-zinc-100 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category || category.postCount === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-xl text-zinc-500">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <SEO
        title={`${category.name} - Category`}
        description={`Browse all ${category.postCount} articles in ${category.name}.`}
      />
      <header className="mb-16">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
          {category.name}
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          {category.postCount} article{category.postCount !== 1 ? "s" : ""} in this category
        </p>
      </header>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">No posts in this category yet.</p>
      )}
    </div>
  );
}
