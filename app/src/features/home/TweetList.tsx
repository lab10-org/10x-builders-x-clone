import type { Tweet } from "../social/types";

type Props = {
  tweets: Tweet[];
  isLoading: boolean;
  error: string;
  onLoadMore: () => void;
  hasMore: boolean;
};

export function TweetList({ tweets, isLoading, error, onLoadMore, hasMore }: Props) {
  if (isLoading && tweets.length === 0) {
    return <p className="text-slate-300">Cargando timeline...</p>;
  }

  if (error && tweets.length === 0) {
    return <p className="text-rose-400">{error}</p>;
  }

  if (!isLoading && tweets.length === 0) {
    return <p className="text-slate-300">Aún no hay tweets en tu home.</p>;
  }

  return (
    <section className="space-y-3">
      {tweets.map((tweet) => (
        <article key={tweet.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">@{tweet.author.username}</p>
            <p className="text-xs text-slate-500">{new Date(tweet.createdAt).toLocaleString()}</p>
          </div>
          {tweet.author.displayName ? <p className="text-sm text-slate-200">{tweet.author.displayName}</p> : null}
          <p className="mt-2 whitespace-pre-wrap text-slate-100">{tweet.content}</p>
        </article>
      ))}

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      {hasMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="w-full rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Cargar más
        </button>
      ) : null}
    </section>
  );
}
