import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthResolver } from "../features/social/auth";
import type { SocialRepository } from "../features/social/repository";
import { createSocialRouter } from "../features/social/routes";

const viewerId = "11111111-1111-4111-8111-111111111111";
const targetId = "22222222-2222-4222-8222-222222222222";

const defaultTweet = {
  id: 1,
  authorId: viewerId,
  content: "hola mundo",
  replyToTweetId: null,
  createdAt: "2026-03-02T00:00:00.000Z",
  author: {
    id: viewerId,
    username: "viewer",
    displayName: "Viewer",
    avatarUrl: null,
  },
};

function buildApp({
  repository,
  resolveUser,
}: {
  repository: SocialRepository;
  resolveUser: AuthResolver;
}) {
  const app = express();
  app.use(express.json());
  app.use("/v1", createSocialRouter({ repository, resolveUser }));
  return app;
}

describe("social routes", () => {
  const repository = {
    createTweet: vi.fn(),
    getHomeTimeline: vi.fn(),
    getProfileByUsername: vi.fn(),
    getProfileTweets: vi.fn(),
    searchProfiles: vi.fn(),
    profileExists: vi.fn(),
    follow: vi.fn(),
    unfollow: vi.fn(),
  } satisfies SocialRepository;

  const resolveUser = vi.fn<AuthResolver>();
  const app = buildApp({ repository, resolveUser });

  beforeEach(() => {
    vi.clearAllMocks();
    resolveUser.mockResolvedValue({ id: viewerId, accessToken: "token" });
    repository.profileExists.mockResolvedValue(true);
  });

  it("creates a tweet", async () => {
    repository.createTweet.mockResolvedValue(defaultTweet);

    const response = await request(app).post("/v1/tweets").send({ content: "  hola mundo  " });

    expect(response.status).toBe(201);
    expect(response.body.tweet.content).toBe("hola mundo");
    expect(repository.createTweet).toHaveBeenCalledWith({
      userId: viewerId,
      accessToken: "token",
      content: "hola mundo",
      replyToTweetId: null,
    });
  });

  it("rejects empty tweet content", async () => {
    const response = await request(app).post("/v1/tweets").send({ content: "   " });
    expect(response.status).toBe(400);
  });

  it("returns home timeline with cursor parameters", async () => {
    repository.getHomeTimeline.mockResolvedValue({
      tweets: [defaultTweet],
      nextCursor: { createdAt: defaultTweet.createdAt, tweetId: defaultTweet.id },
    });

    const response = await request(app)
      .get("/v1/timeline/home")
      .query({
        limit: "10",
        cursorCreatedAt: "2026-03-02T00:00:00.000Z",
        cursorTweetId: "120",
      });

    expect(response.status).toBe(200);
    expect(repository.getHomeTimeline).toHaveBeenCalledWith({
      userId: viewerId,
      accessToken: "token",
      limit: 10,
      cursor: {
        createdAt: "2026-03-02T00:00:00.000Z",
        tweetId: 120,
      },
    });
  });

  it("returns profile by username with tweets", async () => {
    repository.getProfileByUsername.mockResolvedValue({
      id: "profile-id",
      username: "alice",
      displayName: "Alice",
      avatarUrl: null,
      isFollowing: true,
    });
    repository.getProfileTweets.mockResolvedValue([defaultTweet]);

    const response = await request(app).get("/v1/profiles/alice");

    expect(response.status).toBe(200);
    expect(response.body.profile.username).toBe("alice");
    expect(response.body.tweets).toHaveLength(1);
  });

  it("searches profiles by q", async () => {
    repository.searchProfiles.mockResolvedValue([
      {
        id: "profile-id",
        username: "alice",
        displayName: "Alice",
        avatarUrl: null,
        isFollowing: true,
      },
    ]);

    const response = await request(app).get("/v1/profiles/search").query({ q: "ali" });

    expect(response.status).toBe(200);
    expect(repository.searchProfiles).toHaveBeenCalledWith({
      query: "ali",
      viewerId,
      accessToken: "token",
    });
  });

  it("follows and unfollows a profile", async () => {
    const followResponse = await request(app).post(`/v1/follows/${targetId}`);
    const unfollowResponse = await request(app).delete(`/v1/follows/${targetId}`);

    expect(followResponse.status).toBe(201);
    expect(unfollowResponse.status).toBe(200);
    expect(repository.follow).toHaveBeenCalledWith({
      followerId: viewerId,
      followedId: targetId,
      accessToken: "token",
    });
    expect(repository.unfollow).toHaveBeenCalledWith({
      followerId: viewerId,
      followedId: targetId,
      accessToken: "token",
    });
  });

  it("returns 404 when follow target does not exist", async () => {
    repository.profileExists.mockResolvedValue(false);
    const response = await request(app).post(`/v1/follows/${targetId}`);
    expect(response.status).toBe(404);
  });

  it("rejects self follow", async () => {
    const response = await request(app).post(`/v1/follows/${viewerId}`);
    expect(response.status).toBe(400);
  });

  it("rejects invalid follow id format", async () => {
    const response = await request(app).post("/v1/follows/not-a-uuid");
    expect(response.status).toBe(400);
  });

  it("returns 401 when no auth", async () => {
    resolveUser.mockResolvedValueOnce(null);
    const response = await request(app).get("/v1/timeline/home");
    expect(response.status).toBe(401);
  });
});
