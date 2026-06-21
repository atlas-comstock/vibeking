import type { Context, Next } from "hono";
import { errorResponse } from "@vibeking/shared";
import { isClaimsEnabled, isWishPlatformEnabled } from "../lib/env.js";

export async function wishPlatformFlag(c: Context, next: Next) {
  if (!isWishPlatformEnabled()) {
    return c.json(
      errorResponse("FEATURE_DISABLED", "Wish platform is currently disabled"),
      503,
    );
  }
  await next();
}

export async function claimsFlag(c: Context, next: Next) {
  if (!isClaimsEnabled()) {
    return c.json(
      errorResponse("FEATURE_DISABLED", "Claims are currently disabled"),
      503,
    );
  }
  await next();
}