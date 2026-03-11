import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

interface CategoryBadgeProps {
  name: string;
  slug: string;
  className?: string;
}

export function CategoryBadge({ name, slug, className }: CategoryBadgeProps) {
  return (
    <Link
      to={`/category/${slug}`}
      className={cn(
        "inline-flex items-center text-xs font-bold uppercase tracking-widest text-[var(--site-primary)] hover:text-[var(--site-primary-hover)] transition-colors",
        className
      )}
    >
      {name}
    </Link>
  );
}
