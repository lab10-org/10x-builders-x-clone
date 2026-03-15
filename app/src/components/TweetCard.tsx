import { formatHandle } from "@10x/shared";
import type { TweetWithAuthor } from "../types/database";

interface TweetCardProps {
  tweet: TweetWithAuthor;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export function TweetCard({ tweet }: TweetCardProps) {
  const { profiles: author } = tweet;

  return (
    <article className="flex gap-3 border-b border-gray-800 px-4 py-3 hover:bg-white/5 transition-colors">
      <div className="flex-shrink-0">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.display_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white font-bold text-sm">
            {author.display_name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-bold text-white text-sm truncate">
            {author.display_name}
          </span>
          <span className="text-gray-500 text-sm truncate">
            {formatHandle(author.username)}
          </span>
          <span className="text-gray-500 text-sm">·</span>
          <time
            dateTime={tweet.created_at}
            className="text-gray-500 text-sm flex-shrink-0"
          >
            {formatDate(tweet.created_at)}
          </time>
        </div>
        <p className="mt-1 text-white text-sm whitespace-pre-wrap break-words">
          {tweet.content}
        </p>
      </div>
    </article>
  );
}
