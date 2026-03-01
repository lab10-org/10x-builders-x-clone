import { describe, expect, it } from "vitest";
import { getHealthStatus } from "../health";

describe("health", () => {
  it("returns status ok", () => {
    expect(getHealthStatus()).toEqual({ status: "ok" });
  });
});
