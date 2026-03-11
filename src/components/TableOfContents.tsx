import { cn } from "../lib/utils";

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 = h2, 3 = h3, etc.
}

interface TableOfContentsProps {
  items: TocItem[];
  activeId?: string | null;
  className?: string;
}

export function TableOfContents({ items, activeId, className }: TableOfContentsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className={cn("sticky top-24 space-y-2", className)}
    >
      <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
        On this page
      </h2>
      <ul className="space-y-2 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ marginLeft: (item.level - 2) * 12 }}
            className={cn(
              "text-sm",
              item.level > 2 && "ml-3"
            )}
          >
            <a
              href={`#${item.id}`}
              className={cn(
                "block py-1 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border-l-2 -ml-[2px] pl-3",
                activeId === item.id
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-medium"
                  : "border-transparent"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
