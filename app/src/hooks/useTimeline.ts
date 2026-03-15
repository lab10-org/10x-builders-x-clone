import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { TweetWithAuthor } from "../types/database";

interface UseTimelineReturn {
  tweets: TweetWithAuthor[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTimeline(): UseTimelineReturn {
  const [tweets, setTweets] = useState<TweetWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTweets = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("tweets")
      .select("*, profiles(*)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setTweets((data as TweetWithAuthor[]) ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchTweets();
  }, [fetchTweets]);

  return { tweets, loading, error, refetch: fetchTweets };
}
