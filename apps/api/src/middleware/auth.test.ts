import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { generateApiKey } from "../services/api-key-service.js";

const secret = new TextEncoder().encode("test-session-secret");

describe("auth middleware helpers", () => {
  it("creates and verifies session JWT", async () => {
    const token = await new SignJWT({ sub: "user-123" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secret);

    const { payload } = await jwtVerify(token, secret);
    expect(payload.sub).toBe("user-123");
  });

  it("hashes and verifies vk_* API keys with bcrypt", async () => {
    const rawKey = generateApiKey();
    expect(rawKey.startsWith("vk_")).toBe(true);

    const hash = await bcrypt.hash(rawKey, 4);
    expect(await bcrypt.compare(rawKey, hash)).toBe(true);
    expect(await bcrypt.compare("vk_wrong", hash)).toBe(false);
  });
});