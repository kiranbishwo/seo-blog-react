import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  article?: boolean;
  author?: string;
  publishedAt?: string;
  canonical?: string;
}

export function SEO({
  title,
  description,
  image,
  article,
  author,
  publishedAt,
  canonical,
}: SEOProps) {
  const siteName = "Lumina Blog";
  const fullTitle = `${title} | ${siteName}`;
  const defaultImage = "https://picsum.photos/seed/lumina/1200/630";
  const ogImage = image || defaultImage;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={article ? "article" : "website"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {article && author && <meta name="article:author" content={author} />}
      {article && publishedAt && (
        <meta name="article:published_time" content={publishedAt} />
      )}

      {/* Structured Data */}
      {article && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": title,
            "image": [ogImage],
            "datePublished": publishedAt,
            "author": [
              {
                "@type": "Person",
                "name": author,
              },
            ],
          })}
        </script>
      )}
    </Helmet>
  );
}
