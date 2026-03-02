import { createClient } from "@supabase/supabase-js";
import type { ProfileRecord, TimelineCursor, TimelineResult, TweetRecord } from "./types";

type RawTweet = {
  id: number;
  author_id: string;
  content: string;
  reply_to_tweet_id: number | null;
  created_at: string;
};

type RawProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

function buildClient(accessToken?: string) {
  return createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), {
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

function toTweetRecord(tweet: RawTweet, author: RawProfile): TweetRecord {
  return {
    id: tweet.id,
    authorId: tweet.author_id,
    content: tweet.content,
    replyToTweetId: tweet.reply_to_tweet_id,
    createdAt: tweet.created_at,
    author: {
      id: author.id,
      username: author.username,
      displayName: author.display_name,
      avatarUrl: author.avatar_url,
    },
  };
}

function paginateTimeline(
  tweets: TweetRecord[],
  limit: number,
  cursor: TimelineCursor | null,
): TimelineResult {
  const sorted = [...tweets].sort((left, right) => {
    const createdAtCompare = right.createdAt.localeCompare(left.createdAt);
    if (createdAtCompare !== 0) {
      return createdAtCompare;
    }
    return right.id - left.id;
  });

  const filtered = cursor
    ? sorted.filter((tweet) => {
        if (tweet.createdAt < cursor.createdAt) {
          return true;
        }
        if (tweet.createdAt > cursor.createdAt) {
          return false;
        }
        return tweet.id < cursor.tweetId;
      })
    : sorted;

  const limited = filtered.slice(0, limit);
  const lastTweet = limited.at(-1);

  return {
    tweets: limited,
    nextCursor: limited.length === limit && lastTweet
      ? {
          createdAt: lastTweet.createdAt,
          tweetId: lastTweet.id,
        }
      : null,
  };
}

export type SocialRepository = {
  createTweet(input: {
    userId: string;
    accessToken: string;
    content: string;
    replyToTweetId: number | null;
  }): Promise<TweetRecord>;
  getHomeTimeline(input: {
    userId: string;
    accessToken: string;
    limit: number;
    cursor: TimelineCursor | null;
  }): Promise<TimelineResult>;
  getProfileByUsername(input: {
    username: string;
    viewerId: string;
    accessToken: string;
  }): Promise<ProfileRecord | null>;
  getProfileTweets(input: { profileId: string; accessToken: string; limit: number }): Promise<TweetRecord[]>;
  searchProfiles(input: {
    query: string;
    viewerId: string;
    accessToken: string;
  }): Promise<ProfileRecord[]>;
  profileExists(input: { profileId: string; accessToken: string }): Promise<boolean>;
  follow(input: { followerId: string; followedId: string; accessToken: string }): Promise<void>;
  unfollow(input: { followerId: string; followedId: string; accessToken: string }): Promise<void>;
};

export function createSupabaseSocialRepository(): SocialRepository {
  return {
    async createTweet({ userId, accessToken, content, replyToTweetId }) {
      const client = buildClient(accessToken);
      const { data, error } = await client
        .from("tweets")
        .insert({
          author_id: userId,
          content,
          reply_to_tweet_id: replyToTweetId,
        })
        .select("id, author_id, content, reply_to_tweet_id, created_at")
        .single<RawTweet>();

      if (error || !data) {
        throw new Error(error?.message ?? "Failed to create tweet");
      }

      const { data: author, error: authorError } = await client
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("id", data.author_id)
        .single<RawProfile>();

      if (authorError || !author) {
        throw new Error(authorError?.message ?? "Failed to load tweet author");
      }

      return toTweetRecord(data, author);
    },

    async getHomeTimeline({ userId, accessToken, limit, cursor }) {
      const client = buildClient(accessToken);
      const queryLimit = Math.max(limit * 3, 30);
      const cursorFilter = cursor
        ? `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},tweet_id.lt.${cursor.tweetId})`
        : null;
      const ownCursorFilter = cursor
        ? `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.tweetId})`
        : null;

      const followingQuery = client
        .from("following_feed")
        .select("tweet_id, author_id, content, reply_to_tweet_id, created_at")
        .eq("follower_id", userId)
        .order("created_at", { ascending: false })
        .order("tweet_id", { ascending: false })
        .limit(queryLimit);

      const ownQuery = client
        .from("tweets")
        .select("id, author_id, content, reply_to_tweet_id, created_at")
        .eq("author_id", userId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(queryLimit);

      const [{ data: followingRows, error: followingError }, { data: ownRows, error: ownError }] =
        await Promise.all([
          cursorFilter ? followingQuery.or(cursorFilter) : followingQuery,
          ownCursorFilter ? ownQuery.or(ownCursorFilter) : ownQuery,
        ]);

      if (followingError || ownError) {
        throw new Error(followingError?.message ?? ownError?.message ?? "Failed to load timeline");
      }

      const followingTweets: RawTweet[] = (followingRows ?? [])
        .filter((row): row is { tweet_id: number; author_id: string; content: string; reply_to_tweet_id: number | null; created_at: string } => {
          return (
            typeof row.tweet_id === "number" &&
            typeof row.author_id === "string" &&
            typeof row.content === "string" &&
            typeof row.created_at === "string"
          );
        })
        .map((row) => ({
          id: row.tweet_id,
          author_id: row.author_id,
          content: row.content,
          reply_to_tweet_id: row.reply_to_tweet_id,
          created_at: row.created_at,
        }));

      const ownTweets = (ownRows ?? []) as RawTweet[];
      const tweetMap = new Map<number, RawTweet>();
      [...followingTweets, ...ownTweets].forEach((tweet) => {
        tweetMap.set(tweet.id, tweet);
      });

      const dedupedTweets = [...tweetMap.values()];
      const authorIds = [...new Set(dedupedTweets.map((tweet) => tweet.author_id))];

      let authorMap = new Map<string, RawProfile>();
      if (authorIds.length > 0) {
        const { data: authors, error: authorsError } = await client
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", authorIds);

        if (authorsError) {
          throw new Error(authorsError.message);
        }

        authorMap = new Map((authors ?? []).map((author) => [author.id, author as RawProfile]));
      }

      const tweets = dedupedTweets
        .map((tweet) => {
          const author = authorMap.get(tweet.author_id);
          if (!author) {
            return null;
          }
          return toTweetRecord(tweet, author);
        })
        .filter((tweet): tweet is TweetRecord => tweet !== null);

      return paginateTimeline(tweets, limit, cursor);
    },

    async getProfileByUsername({ username, viewerId, accessToken }) {
      const client = buildClient(accessToken);
      const { data: profile, error } = await client
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("username", username)
        .maybeSingle<RawProfile>();

      if (error) {
        throw new Error(error.message);
      }
      if (!profile) {
        return null;
      }

      const { data: relation, error: relationError } = await client
        .from("follows")
        .select("followed_id")
        .eq("follower_id", viewerId)
        .eq("followed_id", profile.id)
        .maybeSingle<{ followed_id: string }>();

      if (relationError) {
        throw new Error(relationError.message);
      }

      return {
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        isFollowing: Boolean(relation?.followed_id),
      };
    },

    async getProfileTweets({ profileId, accessToken, limit }) {
      const client = buildClient(accessToken);

      const [{ data: rows, error }, { data: profile, error: profileError }] = await Promise.all([
        client
          .from("tweets")
          .select("id, author_id, content, reply_to_tweet_id, created_at")
          .eq("author_id", profileId)
          .order("created_at", { ascending: false })
          .limit(limit),
        client
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .eq("id", profileId)
          .single<RawProfile>(),
      ]);

      if (error || profileError || !profile) {
        throw new Error(error?.message ?? profileError?.message ?? "Failed to load profile tweets");
      }

      return ((rows ?? []) as RawTweet[]).map((tweet) => toTweetRecord(tweet, profile));
    },

    async searchProfiles({ query, viewerId, accessToken }) {
      const client = buildClient(accessToken);
      const { data: profiles, error } = await client
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .ilike("username", `${query}%`)
        .limit(10);

      if (error) {
        throw new Error(error.message);
      }

      const profileRows = (profiles ?? []) as RawProfile[];
      if (profileRows.length === 0) {
        return [];
      }

      const ids = profileRows.map((profile) => profile.id);
      const { data: followRows, error: followError } = await client
        .from("follows")
        .select("followed_id")
        .eq("follower_id", viewerId)
        .in("followed_id", ids);

      if (followError) {
        throw new Error(followError.message);
      }

      const followedIds = new Set((followRows ?? []).map((row) => row.followed_id));
      return profileRows.map((profile) => ({
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        isFollowing: followedIds.has(profile.id),
      }));
    },

    async profileExists({ profileId, accessToken }) {
      const client = buildClient(accessToken);
      const { data, error } = await client
        .from("profiles")
        .select("id")
        .eq("id", profileId)
        .maybeSingle<{ id: string }>();

      if (error) {
        throw new Error(error.message);
      }

      return Boolean(data?.id);
    },

    async follow({ followerId, followedId, accessToken }) {
      const client = buildClient(accessToken);
      const { error } = await client.from("follows").insert({
        follower_id: followerId,
        followed_id: followedId,
      });

      if (error) {
        throw new Error(error.message);
      }
    },

    async unfollow({ followerId, followedId, accessToken }) {
      const client = buildClient(accessToken);
      const { error } = await client
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("followed_id", followedId);

      if (error) {
        throw new Error(error.message);
      }
    },
  };
}
