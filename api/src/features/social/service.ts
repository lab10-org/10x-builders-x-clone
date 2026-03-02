import type { SocialRepository } from "./repository";
import type { ProfileWithTweets, TimelineCursor } from "./types";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("Invalid positive integer");
  }
  return parsed;
}

export function parseTimelineLimit(value: string | undefined): number {
  const parsed = parsePositiveInt(value, 20);
  return Math.min(parsed, 50);
}

export function parseTimelineCursor(input: {
  cursorCreatedAt?: string;
  cursorTweetId?: string;
}): TimelineCursor | null {
  if (!input.cursorCreatedAt && !input.cursorTweetId) {
    return null;
  }
  if (!input.cursorCreatedAt || !input.cursorTweetId) {
    throw new Error("Timeline cursor is incomplete");
  }

  const parsedId = Number.parseInt(input.cursorTweetId, 10);
  if (Number.isNaN(parsedId) || parsedId <= 0) {
    throw new Error("Invalid timeline cursor tweet id");
  }

  const parsedDate = new Date(input.cursorCreatedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid timeline cursor createdAt");
  }

  return {
    createdAt: parsedDate.toISOString(),
    tweetId: parsedId,
  };
}

export function sanitizeTweetContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length < 1 || trimmed.length > 255) {
    throw new Error("Tweet content must be between 1 and 255 characters");
  }
  return trimmed;
}

export function sanitizeSearchQuery(query: string): string {
  const trimmed = query.trim();
  if (trimmed.length < 1) {
    throw new Error("Query is required");
  }
  return trimmed.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export async function getProfileWithTweets(input: {
  repository: SocialRepository;
  username: string;
  viewerId: string;
  accessToken: string;
}): Promise<ProfileWithTweets | null> {
  const profile = await input.repository.getProfileByUsername({
    username: input.username,
    viewerId: input.viewerId,
    accessToken: input.accessToken,
  });

  if (!profile) {
    return null;
  }

  const tweets = await input.repository.getProfileTweets({
    profileId: profile.id,
    accessToken: input.accessToken,
    limit: 50,
  });

  return { profile, tweets };
}
