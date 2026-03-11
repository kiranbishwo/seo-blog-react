import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Post } from "../types";
import { BlogCard } from "../components/BlogCard";
import { SEO } from "../components/SEO";

interface AuthorWithPosts {
  id: number;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  posts: Post[];
}

export function AuthorPage() {
  const { username } = useParams<{ username: string }>();
  const [author, setAuthor] = useState<AuthorWithPosts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    fetch(`/api/authors/${username}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setAuthor(null);
        else setAuthor(data);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse flex flex-col sm:flex-row gap-8 items-center sm:items-start mb-16">
          <div className="h-24 w-24 rounded-full bg-zinc-100" />
          <div className="space-y-2 flex-1">
            <div className="h-8 bg-zinc-100 rounded w-48" />
            <div className="h-4 bg-zinc-100 rounded w-full" />
            <div className="h-4 bg-zinc-100 rounded w-2/3" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-video bg-zinc-100 rounded-2xl" />
              <div className="h-6 bg-zinc-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-xl text-zinc-500">Author not found.</p>
      </div>
    );
  }

  const posts = author.posts || [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <SEO
        title={`${author.name} - Author`}
        description={author.bio || `Articles by ${author.name}.`}
        image={author.avatar_url}
      />
      <header className="mb-16 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.name}
            className="h-24 w-24 rounded-full object-cover shadow-lg"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-3xl font-bold text-zinc-600 dark:text-zinc-300 shadow-lg shrink-0">
            {(author.name || author.username || "?").slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
            {author.name}
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {author.bio}
          </p>
          <p className="mt-4 text-zinc-500 dark:text-zinc-500">
            {posts.length} article{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 dark:text-zinc-400">No posts yet.</p>
      )}
    </div>
  );
}
