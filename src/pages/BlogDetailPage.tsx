import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Post } from "../types";
import { SEO } from "../components/SEO";
import { formatDate } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Clock, User, ArrowLeft, Share2, Twitter, Linkedin, Facebook } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <div className="mx-auto max-w-3xl px-4 py-24 space-y-8 animate-pulse">
      <div className="h-4 bg-zinc-100 rounded w-24"></div>
      <div className="h-12 bg-zinc-100 rounded w-full"></div>
      <div className="aspect-video bg-zinc-100 rounded-3xl"></div>
      <div className="space-y-4">
        <div className="h-4 bg-zinc-100 rounded w-full"></div>
        <div className="h-4 bg-zinc-100 rounded w-full"></div>
        <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
      </div>
    </div>
  );

  if (!post) return <div className="py-24 text-center">Post not found</div>;

  return (
    <div className="relative">
      <SEO 
        title={post.title} 
        description={post.excerpt} 
        image={post.featured_image}
        article={true}
        author={post.author_name}
        publishedAt={post.published_at}
      />

      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-16 left-0 right-0 h-1 bg-emerald-600 origin-left z-50"
        style={{ scaleX }}
      />

      <article className="mx-auto max-w-4xl px-4 py-16 sm:py-24">
        <Link to="/blog" className="inline-flex items-center space-x-2 text-zinc-500 hover:text-emerald-600 transition-colors mb-12 group">
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to blog</span>
        </Link>

        <header className="mb-12">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 uppercase tracking-widest mb-6">
            <span>{post.category_name}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 mb-8 leading-[1.1]">
            {post.title}
          </h1>
          <p className="text-xl text-zinc-600 mb-10 leading-relaxed italic">
            {post.excerpt}
          </p>
          
          <div className="flex flex-wrap items-center justify-between gap-6 border-y border-zinc-100 py-8">
            <div className="flex items-center space-x-4">
              <img 
                src={post.author_avatar} 
                alt={post.author_name} 
                className="h-12 w-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <Link to={`/author/${post.author_username}`} className="text-base font-bold text-zinc-900 hover:text-emerald-600 transition-colors">
                  {post.author_name}
                </Link>
                <div className="flex items-center space-x-3 text-sm text-zinc-500">
                  <span>{formatDate(post.published_at)}</span>
                  <span className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{post.reading_time} min read</span>
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-emerald-600 transition-colors">
                <Twitter size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-emerald-600 transition-colors">
                <Linkedin size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-emerald-600 transition-colors">
                <Facebook size={20} />
              </button>
              <button className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-emerald-600 transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </header>

        <div className="mb-16">
          <img 
            src={post.featured_image} 
            alt={post.title} 
            className="w-full rounded-3xl shadow-2xl shadow-zinc-200"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-zinc prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-emerald-600 prose-img:rounded-2xl">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <footer className="mt-24 pt-12 border-t border-zinc-100">
          <div className="bg-zinc-50 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <img 
              src={post.author_avatar} 
              alt={post.author_name} 
              className="h-24 w-24 rounded-full object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
            <div className="text-center sm:text-left">
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Written by {post.author_name}</h3>
              <p className="text-zinc-600 mb-6 leading-relaxed">
                {post.author_bio}
              </p>
              <Link 
                to={`/author/${post.author_username}`}
                className="inline-flex items-center space-x-2 text-emerald-600 font-semibold hover:text-emerald-500 transition-colors"
              >
                <span>View all posts</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}

function ArrowRight({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
