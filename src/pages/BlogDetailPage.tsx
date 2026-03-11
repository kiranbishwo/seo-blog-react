import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Post } from "../types";
import { SEO } from "../components/SEO";
import { formatDate } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clock, ArrowLeft } from "lucide-react";
import { ReadingProgressBar } from "../components/ReadingProgressBar";
import { ShareButtons } from "../components/ShareButtons";
import { AuthorBox } from "../components/AuthorBox";
import { CategoryBadge } from "../components/CategoryBadge";
import { TagBadge } from "../components/TagBadge";
import { TableOfContents } from "../components/TableOfContents";
import { ArticleLayout } from "../components/ArticleLayout";
import { BlogCard } from "../components/BlogCard";
import { extractTocFromMarkdown, slugify } from "../lib/toc";

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/api/posts/${slug}`).then((r) => r.json()),
      fetch(`/api/posts/${slug}/related`).then((r) => r.json()),
    ])
      .then(([data, relatedList]) => {
        setPost(data);
        setRelated(Array.isArray(relatedList) ? relatedList : []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const tocItems = useMemo(() => (post?.content ? extractTocFromMarkdown(post.content) : []), [post?.content]);
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : undefined;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 space-y-8 animate-pulse">
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-24" />
        <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
        <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (!post) return <div className="py-24 text-center text-zinc-500 dark:text-zinc-400">Post not found</div>;

  const categorySlug = post.category_slug ?? post.category_name?.toLowerCase().replace(/\s+/g, "-") ?? "";

  function headingText(node: React.ReactNode): string {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(headingText).join("");
    return "";
  }

  const markdownComponents = {
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = headingText(children);
      return (
        <h2 id={text ? slugify(text) : undefined} className="scroll-mt-24" {...props}>
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
      const text = headingText(children);
      return (
        <h3 id={text ? slugify(text) : undefined} className="scroll-mt-24" {...props}>
          {children}
        </h3>
      );
    },
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const match = /language-(\w+)/.exec(className || "");
      if (match) {
        return (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: "1.5rem 0", borderRadius: "1rem" }}
            codeTagProps={{ style: {} }}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        );
      }
      return (
        <code className="bg-zinc-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono text-[0.9em]" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="relative">
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.featured_image}
        article={true}
        author={post.author_name}
        publishedAt={post.published_at}
        canonical={canonical}
      />

      <ReadingProgressBar />

      <ArticleLayout
        tableOfContents={tocItems.length > 0 ? <TableOfContents items={tocItems} /> : undefined}
        header={
          <>
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 transition-colors mb-12 group"
            >
              <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to blog</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6">
              <CategoryBadge
                name={post.category_name ?? "Uncategorized"}
                slug={categorySlug || "uncategorized"}
              />
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8 leading-[1.1]">
              {post.title}
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed italic">
              {post.excerpt}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-6 border-y border-zinc-100 dark:border-zinc-800 py-8">
              <div className="flex items-center space-x-4">
                <img
                  src={post.author_avatar}
                  alt={post.author_name ?? ""}
                  className="h-12 w-12 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <Link
                    to={`/author/${post.author_username ?? ""}`}
                    className="text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 transition-colors"
                  >
                    {post.author_name}
                  </Link>
                  <div className="flex items-center space-x-3 text-sm text-zinc-500 dark:text-zinc-400">
                    <span>{formatDate(post.published_at)}</span>
                    <span className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{post.reading_time} min read</span>
                    </span>
                  </div>
                </div>
              </div>
              <ShareButtons url={`/blog/${post.slug}`} title={post.title} description={post.excerpt} />
            </div>
            <div className="mb-16">
              <img
                src={post.featured_image}
                alt={post.title}
                loading="lazy"
                className="w-full rounded-3xl shadow-2xl shadow-zinc-200 dark:shadow-none"
                referrerPolicy="no-referrer"
              />
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <TagBadge key={tag.id} name={tag.name} slug={tag.slug} />
                ))}
              </div>
            )}
          </>
        }
        body={
          <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-600 prose-img:rounded-2xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={markdownComponents}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        }
        authorSection={
          <AuthorBox
            name={post.author_name ?? ""}
            username={post.author_username ?? ""}
            bio={post.author_bio ?? ""}
            avatarUrl={post.author_avatar ?? ""}
          />
        }
        relatedSection={
          related.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">Related articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map((p) => (
                  <BlogCard key={p.id} post={p} />
                ))}
              </div>
            </>
          ) : undefined
        }
      />
    </div>
  );
}
