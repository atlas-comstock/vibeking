export function envString(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function envBool(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

export function getSessionSecret(): string {
  return envString("SESSION_SECRET", "dev-session-secret-change-me");
}

export function isInviteOnly(): boolean {
  return envBool("INVITE_ONLY", false);
}

export function getInviteCodes(): string[] {
  const raw = process.env.INVITE_CODES ?? "";
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export function isWishPlatformEnabled(): boolean {
  return envBool("WISH_PLATFORM_ENABLED", true);
}

export function isClaimsEnabled(): boolean {
  return envBool("CLAIMS_ENABLED", true);
}