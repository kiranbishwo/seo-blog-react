import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    fetch(`/api/legal/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => setPage({ title: data.title, content: data.content || "" }))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Page not found</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">This legal page could not be found.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.title}</title>
      </Helmet>
      <article className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-8">{page.title}</h1>
        {page.content ? (
          <div
            className="prose prose-zinc dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-zinc-500">No content yet.</p>
        )}
      </article>
    </>
  );
}
