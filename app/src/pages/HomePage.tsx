import { useAuth } from "../context/AuthContext";
import { useTimeline } from "../hooks/useTimeline";
import { TweetCard } from "../components/TweetCard";
import { TweetComposer } from "../components/TweetComposer";
import { buildHomeTimelineTitle } from "../lib/timeline";

export function HomePage() {
  const { user, signOut } = useAuth();
  const { tweets, loading, error, refetch } = useTimeline();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-xl border-x border-gray-800 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-black/80 px-4 py-3 backdrop-blur-sm">
          <h1 className="text-lg font-bold">
            {buildHomeTimelineTitle(tweets.length)}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 truncate max-w-[140px]">
              {user?.email}
            </span>
            <button
              onClick={() => void signOut()}
              className="rounded-full border border-gray-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/10 transition"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Composer */}
        <TweetComposer onTweetCreated={refetch} />

        {/* Timeline */}
        <section aria-label="Timeline">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-white" />
            </div>
          )}

          {error && (
            <p className="px-4 py-6 text-center text-red-400 text-sm">
              Error al cargar tweets: {error}
            </p>
          )}

          {!loading && !error && tweets.length === 0 && (
            <p className="px-4 py-12 text-center text-gray-500">
              Aún no hay tweets. ¡Sé el primero en publicar!
            </p>
          )}

          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </section>
      </div>
    </div>
  );
}
