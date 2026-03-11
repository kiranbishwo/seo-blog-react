import { Link } from "react-router-dom";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";
import { SEO } from "../components/SEO";

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-24">
      <SEO title="Page not found" description="The page you're looking for doesn't exist." />
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-8">
          <FileQuestion className="text-zinc-500 dark:text-zinc-400" size={40} />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
          Page not found
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold"
          >
            <Home size={20} />
            Back to home
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-600 px-6 py-3 font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Browse blog
          </Link>
        </div>
      </div>
    </div>
  );
}
