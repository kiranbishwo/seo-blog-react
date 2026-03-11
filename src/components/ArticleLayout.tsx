import { ReactNode } from "react";

interface ArticleLayoutProps {
  header: ReactNode;
  featuredImage?: ReactNode;
  body: ReactNode;
  authorSection?: ReactNode;
  relatedSection?: ReactNode;
  tableOfContents?: ReactNode;
  className?: string;
}

export function ArticleLayout({
  header,
  featuredImage,
  body,
  authorSection,
  relatedSection,
  tableOfContents,
  className = "",
}: ArticleLayoutProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:gap-16">
        {tableOfContents && (
          <aside className="hidden xl:block w-56 shrink-0">
            {tableOfContents}
          </aside>
        )}
        <article className="min-w-0 flex-1 max-w-4xl">
          {header}
          {featuredImage}
          {body}
          {authorSection && <footer className="mt-24 pt-12 border-t border-zinc-100 dark:border-zinc-800">{authorSection}</footer>}
          {relatedSection && (
            <section className="mt-24 pt-12 border-t border-zinc-100 dark:border-zinc-800">
              {relatedSection}
            </section>
          )}
        </article>
      </div>
    </div>
  );
}
