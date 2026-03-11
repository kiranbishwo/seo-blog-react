import type { TocItem } from "../components/TableOfContents";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractTocFromMarkdown(content: string): TocItem[] {
  const items: TocItem[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].replace(/#+$/, "").trim();
    items.push({ id: slugify(text), text, level });
  }
  return items;
}
