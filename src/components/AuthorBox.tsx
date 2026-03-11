import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface AuthorBoxProps {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

export function AuthorBox({ name, username, bio, avatarUrl }: AuthorBoxProps) {
  const initial = (name || username || "?").slice(0, 1).toUpperCase();
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-start gap-8">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-24 w-24 rounded-full object-cover shadow-lg"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-3xl font-bold text-zinc-600 dark:text-zinc-300 shadow-lg shrink-0">
          {initial}
        </span>
      )}
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Written by {name}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
          {bio}
        </p>
        <Link
          to={`/author/${username}`}
          className="inline-flex items-center space-x-2 text-emerald-600 font-semibold hover:text-emerald-500 transition-colors"
        >
          <span>View all posts</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
