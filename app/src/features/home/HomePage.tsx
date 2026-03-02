import { useEffect, useState } from "react";
import { createTweet, getHomeTimeline } from "../../lib/apiClient";
import { TweetComposer } from "./TweetComposer";
import { TweetList } from "./TweetList";
import { UserSearch } from "./UserSearch";
import type { TimelineCursor, Tweet } from "../social/types";

export function HomePage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [nextCursor, setNextCursor] = useState<TimelineCursor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTimeline(cursor: TimelineCursor | null, append: boolean) {
    setError("");
    if (!append) {
      setIsLoading(true);
    }

    try {
      const response = await getHomeTimeline({ limit: 20, cursor });
      setTweets((current) => (append ? [...current, ...response.tweets] : response.tweets));
      setNextCursor(response.nextCursor);
    } catch (timelineError) {
      if (timelineError instanceof Error) {
        setError(timelineError.message);
      } else {
        setError("No se pudo cargar el timeline");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadTimeline(null, false);
  }, []);

  async function handleTweet(content: string) {
    await createTweet(content);
    await loadTimeline(null, false);
  }

  return (
    <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <TweetComposer onSubmitTweet={handleTweet} />
        <TweetList
          tweets={tweets}
          isLoading={isLoading}
          error={error}
          hasMore={Boolean(nextCursor)}
          onLoadMore={() => {
            if (nextCursor) {
              void loadTimeline(nextCursor, true);
            }
          }}
        />
      </div>
      <div>
        <UserSearch />
      </div>
    </div>
  );
}
