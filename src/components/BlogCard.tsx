import { Link } from "react-router-dom";
import { Post } from "../types";
import { formatDate } from "../lib/utils";
import { Clock, User } from "lucide-react";

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group flex flex-col space-y-4 border-b border-zinc-100 pb-8 last:border-0">
      <Link to={`/blog/${post.slug}`} className="overflow-hidden rounded-2xl">
        <img
          src={post.featured_image}
          alt={post.title}
          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </Link>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-600 uppercase tracking-wider">
          <span>{post.category_name}</span>
        </div>
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 group-hover:text-emerald-600 transition-colors">
            {post.title}
          </h2>
        </Link>
        <p className="text-zinc-600 line-clamp-2 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="flex items-center space-x-4 pt-2 text-sm text-zinc-500">
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
