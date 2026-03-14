import { describe, expect, it } from "vitest";
import { buildHomeTimelineTitle } from "./timeline";

describe("buildHomeTimelineTitle", () => {
  it("returns base title when there are no posts", () => {
    expect(buildHomeTimelineTitle(0)).toBe("Inicio");
  });

  it("returns count when there are posts", () => {
    expect(buildHomeTimelineTitle(3)).toBe("Inicio · 3 posts");
  });
});
