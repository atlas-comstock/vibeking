export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export const WEB_ORIGIN = process.env.NEXT_PUBLIC_WEB_ORIGIN ?? "http://localhost:2345";

export const PREVIEW_ORIGIN =
  process.env.NEXT_PUBLIC_PREVIEW_ORIGIN ?? "https://preview.vibeking.dev";

export const SESSION_COOKIE = "vk_session";
export const CSRF_COOKIE = "vk_csrf";

export const PROTECTED_PATHS = ["/wishes/new", "/dashboard"];