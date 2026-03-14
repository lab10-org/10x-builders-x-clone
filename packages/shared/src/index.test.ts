import { describe, expect, it } from "vitest";
import { formatHandle } from "./index";

describe("formatHandle", () => {
  it("adds @ prefix if missing", () => {
    expect(formatHandle("juan")).toBe("@juan");
  });

  it("keeps @ prefix if already present", () => {
    expect(formatHandle("@ana")).toBe("@ana");
  });
});
