import { useState } from "react";
import { Link } from "react-router-dom";
import { Post } from "../types";
import { formatDate } from "../lib/utils";
import { Clock, User } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";
import { TagBadge } from "./TagBadge";

interface BlogCardProps {
  post: Post;
}

const FALLBACK_IMAGE = "https://picsum.photos/seed/blog/1200/630";

export function BlogCard({ post }: BlogCardProps) {
  const [imgSrc, setImgSrc] = useState(post.featured_image || FALLBACK_IMAGE);
  const categorySlug = post.category_slug ?? post.category_name?.toLowerCase().replace(/\s+/g, "-") ?? "";
  const authorName = post.author_name ?? post.author_username ?? "Unknown author";
  const authorLink = post.author_username ? `/author/${post.author_username}` : null;
  const formattedDate = formatDate(post.published_at);
  const readingTime = post.reading_time != null ? post.reading_time : null;
  const excerpt = post.excerpt ?? "";

  return (
    <article className="group flex flex-col space-y-4 border-b border-zinc-100 dark:border-zinc-800 pb-8 last:border-0">
      <Link to={`/blog/${post.slug}`} className="overflow-hidden rounded-2xl">
        <img
          src={imgSrc}
          alt={post.title ?? "Post image"}
          loading="lazy"
          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
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
        {excerpt && (
          <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>
        )}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 pt-2 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center space-x-2">
            {post.author_avatar ? (
              <img
                src={post.author_avatar}
                alt=""
                className="h-6 w-6 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                {authorName.slice(0, 1).toUpperCase()}
              </span>
            )}
            {authorLink ? (
              <Link to={authorLink} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {authorName}
              </Link>
            ) : (
              <span>{authorName}</span>
            )}
          </div>
          {readingTime != null && (
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{readingTime} min read</span>
            </div>
          )}
          {formattedDate && <span>{formattedDate}</span>}
        </div>
      </div>
    </article>
  );
}
