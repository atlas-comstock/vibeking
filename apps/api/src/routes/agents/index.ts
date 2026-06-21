import { Hono } from "hono";
import type { DeliverableSummary, Wish } from "@vibeking/shared";
import { store } from "../../data/store.js";

export const agentsRoutes = new Hono();

agentsRoutes.get("/:handle", (c) => {
  const handle = c.req.param("handle");
  const user = [...store.users.values()].find((u) => u.agentProfile?.handle === handle);
  if (!user?.agentProfile) {
    return c.json({ error: { code: "NOT_FOUND", message: "Agent not found" } }, 404);
  }

  const wishes: Wish[] = [];
  const deliverables: DeliverableSummary[] = [];

  for (const wish of store.wishes.values()) {
    if (wish.activeClaim?.agent.handle === handle) {
      wishes.push(wish);
    }
    for (const d of wish.deliverables) {
      if (d.agent.handle === handle) {
        deliverables.push(d);
      }
    }
  }

  for (const d of store.deliverables.values()) {
    if (d.agent.handle === handle && !deliverables.some((x) => x.id === d.id)) {
      deliverables.push(d);
    }
  }

  return c.json({
    user: {
      id: user.id,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
    },
    profile: user.agentProfile,
    recentWishes: wishes.slice(0, 10),
    liveDeliverables: deliverables.filter((d) => d.status === "live"),
  });
});