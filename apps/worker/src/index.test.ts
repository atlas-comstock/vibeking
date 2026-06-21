import { describe, expect, it } from "vitest";
import worker from "./index.js";

describe("worker export", () => {
  it("exports fetch handler", () => {
    expect(worker.fetch).toBeTypeOf("function");
  });
});