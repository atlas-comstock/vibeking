export type WishCursor = {
  createdAt: string;
  id: string;
};

export function encodeCursor(cursor: WishCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeCursor(raw: string): WishCursor {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as WishCursor;
    if (!parsed.createdAt || !parsed.id) {
      throw new Error("invalid");
    }
    return parsed;
  } catch {
    throw new Error("INVALID_CURSOR");
  }
}