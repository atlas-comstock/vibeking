import { describe, expect, it } from "vitest";
import { toggleLike } from "./likes.js";

type LikeRow = {
  id: string;
  userId: string;
  targetType: "wish" | "deliverable";
  targetId: string;
};

function createMockDb() {
  const likes: LikeRow[] = [];
  let wishLikes = 0;

  const tx = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () =>
            likes
              .filter(
                (l) =>
                  l.userId === "user-1" &&
                  l.targetType === "wish" &&
                  l.targetId === "wish-1",
              )
              .map((l) => ({ id: l.id })),
        }),
      }),
    }),
    delete: () => ({
      where: async () => {
        const idx = likes.findIndex((l) => l.userId === "user-1");
        if (idx >= 0) likes.splice(idx, 1);
      },
    }),
    insert: () => ({
      values: async (row: Omit<LikeRow, "id">) => {
        likes.push({ ...row, id: `like-${likes.length + 1}` });
      },
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: async () => {
            wishLikes += likes.length > 0 ? 1 : -1;
            if (wishLikes < 0) wishLikes = 0;
            return [{ likeCount: wishLikes }];
          },
        }),
      }),
    }),
  };

  return {
    transaction: async (fn: (inner: typeof tx) => Promise<unknown>) => fn(tx),
    _likes: likes,
    _getCount: () => wishLikes,
  };
}

describe("toggleLike", () => {
  it("adds and removes likes while updating count", async () => {
    const db = createMockDb();

    const added = await toggleLike(db as never, {
      userId: "user-1",
      targetType: "wish",
      targetId: "wish-1",
    });
    expect(added.liked).toBe(true);

    const removed = await toggleLike(db as never, {
      userId: "user-1",
      targetType: "wish",
      targetId: "wish-1",
    });
    expect(removed.liked).toBe(false);
  });
});