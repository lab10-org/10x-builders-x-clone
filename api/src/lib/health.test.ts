import { describe, expect, it } from "vitest";
import { createHealthPayload } from "./health";

describe("createHealthPayload", () => {
  it("returns ok with current timestamp", () => {
    const nowIso = new Date().toISOString();
    const payload = createHealthPayload("ok", nowIso);

    expect(payload).toEqual({
      status: "ok",
      timestamp: nowIso
    });
  });
});
