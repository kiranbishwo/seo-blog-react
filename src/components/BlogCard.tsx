import { Link } from "react-router-dom";
import { Post } from "../types";
import { formatDate } from "../lib/utils";
import { Clock, User } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { TagBadge } from "./TagBadge";

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  const categorySlug = post.category_slug ?? post.category_name?.toLowerCase().replace(/\s+/g, "-") ?? "";
  return (
    <article className="group flex flex-col space-y-4 border-b border-zinc-100 dark:border-zinc-800 pb-8 last:border-0">
      <Link to={`/blog/${post.slug}`} className="overflow-hidden rounded-2xl">
        <img
          src={post.featured_image}
          alt={post.title}
          loading="lazy"
          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </Link>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-xs font-medium uppercase tracking-wider">
          <CategoryBadge name={post.category_name ?? "Uncategorized"} slug={categorySlug || "uncategorized"} />
        </div>
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 transition-colors">
            {post.title}
          </h2>
        </Link>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} name={tag.name} slug={tag.slug} />
            ))}
          </div>
        )}
        <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="flex items-center space-x-4 pt-2 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center space-x-1">
            <User size={14} />
            <span>{post.author_name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{post.reading_time} min read</span>
          </div>
          <span>{formatDate(post.published_at)}</span>
        </div>
      </div>
    </article>
  );
}
