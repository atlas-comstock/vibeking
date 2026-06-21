import { cookies } from "next/headers";

export type Locale = "zh" | "en";

export const LOCALE_COOKIE = "vk_locale";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "zh";
}