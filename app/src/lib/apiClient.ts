import { getSupabaseClient } from "./supabase";
import type { Profile, TimelineCursor, Tweet } from "../features/social/types";

type ApiOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
};

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? "http://localhost:3001";
}

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;

  if (!accessToken) {
    throw new Error("No active session");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    signal: AbortSignal.timeout(10000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorPayload?.error ?? "API request failed");
  }

  return (await response.json()) as T;
}

export async function createTweet(content: string): Promise<Tweet> {
  const payload = await apiRequest<{ tweet: Tweet }>("/v1/tweets", {
    method: "POST",
    body: { content },
  });
  return payload.tweet;
}

export async function getHomeTimeline(params?: {
  limit?: number;
  cursor?: TimelineCursor | null;
}): Promise<{ tweets: Tweet[]; nextCursor: TimelineCursor | null }> {
  const search = new URLSearchParams();
  if (params?.limit) {
    search.set("limit", String(params.limit));
  }
  if (params?.cursor) {
    search.set("cursorCreatedAt", params.cursor.createdAt);
    search.set("cursorTweetId", String(params.cursor.tweetId));
  }

  const suffix = search.toString() ? `?${search.toString()}` : "";
  return apiRequest<{ tweets: Tweet[]; nextCursor: TimelineCursor | null }>(`/v1/timeline/home${suffix}`);
}

export async function searchProfiles(query: string): Promise<Profile[]> {
  const params = new URLSearchParams({ q: query });
  const payload = await apiRequest<{ profiles: Profile[] }>(`/v1/profiles/search?${params.toString()}`);
  return payload.profiles;
}

export async function getProfileByUsername(username: string): Promise<{ profile: Profile; tweets: Tweet[] }> {
  return apiRequest<{ profile: Profile; tweets: Tweet[] }>(`/v1/profiles/${username}`);
}

export async function followUser(followedId: string): Promise<void> {
  await apiRequest<{ following: boolean }>(`/v1/follows/${followedId}`, { method: "POST" });
}

export async function unfollowUser(followedId: string): Promise<void> {
  await apiRequest<{ following: boolean }>(`/v1/follows/${followedId}`, { method: "DELETE" });
}
