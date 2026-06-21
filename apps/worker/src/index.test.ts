import { describe, expect, it } from "vitest";
import { WORKER_STUB } from "./index.js";

describe("worker stub", () => {
  it("exports stub flag", () => {
    expect(WORKER_STUB).toBe(true);
  });
});