import { Router } from "express";
import type { AuthResolver } from "./auth";
import type { SocialRepository } from "./repository";
import {
  getProfileWithTweets,
  parseTimelineCursor,
  parseTimelineLimit,
  sanitizeSearchQuery,
  sanitizeTweetContent,
} from "./service";

type Dependencies = {
  repository: SocialRepository;
  resolveUser: AuthResolver;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function createSocialRouter({ repository, resolveUser }: Dependencies): Router {
  const router = Router();

  router.post("/tweets", async (request, response) => {
    const user = await resolveUser(request);
    if (!user) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const content = typeof request.body?.content === "string" ? request.body.content : "";
    const replyToTweetId =
      typeof request.body?.replyToTweetId === "number" ? request.body.replyToTweetId : null;

    try {
      const tweet = await repository.createTweet({
        userId: user.id,
        accessToken: user.accessToken,
        content: sanitizeTweetContent(content),
        replyToTweetId,
      });

      response.status(201).json({ tweet });
    } catch (error) {
      if (error instanceof Error && error.message.includes("between 1 and 255")) {
        response.status(400).json({ error: error.message });
        return;
      }
      response.status(500).json({ error: "Failed to create tweet" });
    }
  });

  router.get("/timeline/home", async (request, response) => {
    const user = await resolveUser(request);
    if (!user) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const timeline = await repository.getHomeTimeline({
        userId: user.id,
        accessToken: user.accessToken,
        limit: parseTimelineLimit(request.query.limit?.toString()),
        cursor: parseTimelineCursor({
          cursorCreatedAt: request.query.cursorCreatedAt?.toString(),
          cursorTweetId: request.query.cursorTweetId?.toString(),
        }),
      });

      response.json(timeline);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Invalid")) {
        response.status(400).json({ error: error.message });
        return;
      }
      response.status(500).json({ error: "Failed to load home timeline" });
    }
  });

  router.get("/profiles/search", async (request, response) => {
    const user = await resolveUser(request);
    if (!user) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    const query = request.query.q?.toString() ?? "";
    try {
      const profiles = await repository.searchProfiles({
        query: sanitizeSearchQuery(query),
        viewerId: user.id,
        accessToken: user.accessToken,
      });
      response.json({ profiles });
    } catch (error) {
      if (error instanceof Error && error.message === "Query is required") {
        response.status(400).json({ error: error.message });
        return;
      }
      response.status(500).json({ error: "Failed to search profiles" });
    }
  });

  router.get("/profiles/:username", async (request, response) => {
    const user = await resolveUser(request);
    if (!user) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const result = await getProfileWithTweets({
        repository,
        username: request.params.username,
        viewerId: user.id,
        accessToken: user.accessToken,
      });

      if (!result) {
        response.status(404).json({ error: "Profile not found" });
        return;
      }

      response.json(result);
    } catch {
      response.status(500).json({ error: "Failed to load profile" });
    }
  });

  router.post("/follows/:followedId", async (request, response) => {
    const user = await resolveUser(request);
    if (!user) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!isUuid(request.params.followedId)) {
      response.status(400).json({ error: "Invalid user id" });
      return;
    }

    if (user.id === request.params.followedId) {
      response.status(400).json({ error: "Cannot follow yourself" });
      return;
    }

    try {
      const exists = await repository.profileExists({
        profileId: request.params.followedId,
        accessToken: user.accessToken,
      });
      if (!exists) {
        response.status(404).json({ error: "Target profile not found" });
        return;
      }

      await repository.follow({
        followerId: user.id,
        followedId: request.params.followedId,
        accessToken: user.accessToken,
      });
      response.status(201).json({ following: true });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to follow user" });
    }
  });

  router.delete("/follows/:followedId", async (request, response) => {
    const user = await resolveUser(request);
    if (!user) {
      response.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!isUuid(request.params.followedId)) {
      response.status(400).json({ error: "Invalid user id" });
      return;
    }

    try {
      const exists = await repository.profileExists({
        profileId: request.params.followedId,
        accessToken: user.accessToken,
      });
      if (!exists) {
        response.status(404).json({ error: "Target profile not found" });
        return;
      }

      await repository.unfollow({
        followerId: user.id,
        followedId: request.params.followedId,
        accessToken: user.accessToken,
      });
      response.json({ following: false });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Failed to unfollow user" });
    }
  });

  return router;
}
