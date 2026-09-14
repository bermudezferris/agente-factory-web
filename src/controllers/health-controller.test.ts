import { describe, expect, it } from "vitest";

import { handleHealth } from "@/controllers/health-controller";

describe("health controller", () => {
  it("returns an operational status without sensitive details", async () => {
    const response = handleHealth();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });
});
