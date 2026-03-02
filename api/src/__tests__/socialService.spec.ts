import { describe, expect, it } from "vitest";
import {
  parseTimelineCursor,
  parseTimelineLimit,
  sanitizeSearchQuery,
  sanitizeTweetContent,
} from "../features/social/service";

describe("social service helpers", () => {
  it("parses timeline limit with max cap", () => {
    expect(parseTimelineLimit(undefined)).toBe(20);
    expect(parseTimelineLimit("15")).toBe(15);
    expect(parseTimelineLimit("99")).toBe(50);
  });

  it("rejects invalid cursor", () => {
    expect(() =>
      parseTimelineCursor({
        cursorCreatedAt: "2026-03-02T00:00:00.000Z",
      }),
    ).toThrow("Timeline cursor is incomplete");
    expect(() =>
      parseTimelineCursor({
        cursorCreatedAt: "broken",
        cursorTweetId: "10",
      }),
    ).toThrow("Invalid timeline cursor createdAt");
  });

  it("validates tweet content length", () => {
    expect(sanitizeTweetContent("  hola  ")).toBe("hola");
    expect(() => sanitizeTweetContent("")).toThrow("Tweet content must be between 1 and 255 characters");
  });

  it("escapes wildcard characters in search query", () => {
    expect(sanitizeSearchQuery("a_b%")).toBe("a\\_b\\%");
  });
});
