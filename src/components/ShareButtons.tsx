import { Twitter, Linkedin, Facebook, Share2 } from "lucide-react";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

function encodeUri(str: string) {
  return encodeURIComponent(str);
}

export function ShareButtons({ url, title, description = "", className = "" }: ShareButtonsProps) {
  const fullUrl = typeof window !== "undefined" ? window.location.origin + url : url;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeUri(fullUrl)}&text=${encodeUri(title)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeUri(fullUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeUri(fullUrl)}`;

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") console.error(err);
      }
    } else {
      await navigator.clipboard?.writeText(fullUrl);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <Twitter size={20} />
      </a>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <Linkedin size={20} />
      </a>
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <Facebook size={20} />
      </a>
      <button
        type="button"
        onClick={handleNativeShare}
        aria-label="Share"
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 hover:text-emerald-600 transition-colors"
      >
        <Share2 size={20} />
      </button>
    </div>
  );
}
