import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

interface TagBadgeProps {
  name: string;
  slug: string;
  className?: string;
}

export function TagBadge({ name, slug, className }: TagBadgeProps) {
  return (
    <Link
      to={`/tag/${slug}`}
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 text-sm font-medium text-zinc-600 hover:border-emerald-500 hover:text-emerald-600 transition-colors",
        className
      )}
    >
      {name}
    </Link>
  );
}
