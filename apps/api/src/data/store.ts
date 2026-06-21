import { randomUUID } from "node:crypto";
import type {
  ApiKey,
  ApiKeyCreated,
  ApiKeyScope,
  DataRecord,
  DeliverableDetail,
  DeliverableSummary,
  User,
  Wish,
} from "@vibeking/shared";

export type Session = {
  id: string;
  userId: string;
  createdAt: string;
};

const now = () => new Date().toISOString();

const demoUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "demo@vibeking.dev",
  displayName: "小明",
  role: "both",
  agentProfile: {
    handle: "xiaoming-dev",
    bio: "Full-stack agent building wish deliverables.",
    completedWishesCount: 3,
    liveDeliverablesCount: 5,
  },
  createdAt: "2026-06-01T00:00:00.000Z",
};

const agentUser: User = {
  id: "660e8400-e29b-41d4-a716-446655440001",
  email: "agent@vibeking.dev",
  displayName: "Agent Chen",
  role: "agent",
  agentProfile: {
    handle: "chen-agent",
    bio: "Specializes in landing pages and dashboards.",
    completedWishesCount: 12,
    liveDeliverablesCount: 8,
  },
  createdAt: "2026-05-15T00:00:00.000Z",
};

const deliverable1: DeliverableSummary = {
  id: "d1",
  slug: "bright-canvas-a7k2",
  kind: "hosted",
  title: "Dark theme waitlist page",
  siteUrl: "https://bright-canvas-a7k2.vibeking.dev/",
  revisionNumber: 2,
  status: "live",
  likeCount: 5,
  viewCount: 89,
  agent: { handle: "xiaoming-dev", displayName: "小明" },
  createdAt: "2026-06-20T08:00:00.000Z",
};

const deliverable2: DeliverableSummary = {
  id: "d2",
  slug: "swift-portal-b3f9",
  kind: "url",
  title: "Figma prototype link",
  siteUrl: "https://figma.com/proto/example",
  revisionNumber: 1,
  status: "live",
  likeCount: 2,
  viewCount: 34,
  agent: { handle: "chen-agent", displayName: "Agent Chen" },
  createdAt: "2026-06-19T12:00:00.000Z",
};

export const store = {
  users: new Map<string, User>([
    [demoUser.id, demoUser],
    [agentUser.id, agentUser],
  ]),
  sessions: new Map<string, Session>(),
  apiKeys: new Map<string, ApiKey & { userId: string; keyHash: string }>(),
  wishes: new Map<string, Wish>([
    [
      "w1",
      {
        id: "w1",
        title: "帮我做一个 landing page",
        description: "科技感，深色主题，含 waitlist 表单。Need a dark tech landing page with waitlist.",
        tags: ["landing-page", "web"],
        budgetCents: 50000,
        budgetCurrency: "CNY",
        deadline: "2026-07-01T00:00:00.000Z",
        status: "delivered",
        author: { id: demoUser.id, displayName: demoUser.displayName },
        activeClaim: {
          id: "c1",
          agentId: agentUser.id,
          agent: { handle: "xiaoming-dev", displayName: "小明" },
          claimedAt: "2026-06-18T10:00:00.000Z",
          lastActivityAt: "2026-06-21T09:00:00.000Z",
        },
        deliverables: [deliverable1],
        canonicalDeliverableId: deliverable1.id,
        likeCount: 12,
        viewCount: 340,
        createdAt: "2026-06-15T10:00:00.000Z",
      },
    ],
    [
      "w2",
      {
        id: "w2",
        title: "Build a bilingual docs site",
        description: "OpenAPI embedded docs with Chinese + English navigation.",
        tags: ["docs", "web"],
        budgetCents: 30000,
        budgetCurrency: "CNY",
        deadline: "2026-07-15T00:00:00.000Z",
        status: "open",
        author: { id: demoUser.id, displayName: demoUser.displayName },
        activeClaim: null,
        deliverables: [],
        canonicalDeliverableId: null,
        likeCount: 4,
        viewCount: 120,
        createdAt: "2026-06-20T08:00:00.000Z",
      },
    ],
    [
      "w3",
      {
        id: "w3",
        title: "数据可视化仪表盘",
        description: "React dashboard with charts for wish analytics. 深色主题，紫色强调色。",
        tags: ["dashboard", "react", "data-viz"],
        budgetCents: 80000,
        budgetCurrency: "CNY",
        deadline: null,
        status: "in_progress",
        author: { id: agentUser.id, displayName: agentUser.displayName },
        activeClaim: {
          id: "c2",
          agentId: demoUser.id,
          agent: { handle: "xiaoming-dev", displayName: "小明" },
          claimedAt: "2026-06-19T14:00:00.000Z",
          lastActivityAt: "2026-06-21T08:00:00.000Z",
        },
        deliverables: [],
        canonicalDeliverableId: null,
        likeCount: 8,
        viewCount: 210,
        createdAt: "2026-06-17T06:00:00.000Z",
      },
    ],
    [
      "w4",
      {
        id: "w4",
        title: "Mobile onboarding flow prototype",
        description: "Interactive prototype for agent onboarding with invite codes.",
        tags: ["mobile", "ux"],
        budgetCents: 25000,
        budgetCurrency: "CNY",
        deadline: "2026-06-30T00:00:00.000Z",
        status: "open",
        author: { id: agentUser.id, displayName: agentUser.displayName },
        activeClaim: null,
        deliverables: [],
        canonicalDeliverableId: null,
        likeCount: 1,
        viewCount: 45,
        createdAt: "2026-06-21T10:00:00.000Z",
      },
    ],
  ]),
  deliverables: new Map<string, DeliverableDetail>([
    [
      deliverable1.slug,
      {
        ...deliverable1,
        description: "Dark theme waitlist page with purple accents.",
        claimActive: true,
        wish: { id: "w1", title: "帮我做一个 landing page", status: "delivered" },
        finalizedAt: "2026-06-21T09:00:00.000Z",
      },
    ],
    [
      deliverable2.slug,
      {
        ...deliverable2,
        description: "External Figma prototype for review.",
        claimActive: false,
        wish: { id: "w2", title: "Build a bilingual docs site", status: "open" },
      },
    ],
  ]),
  trendingWishes: [] as Wish[],
  trendingDeliverables: [deliverable1, deliverable2],
  dataCollections: new Map<string, Map<string, DataRecord[]>>(),
  likedByUser: new Map<string, Set<string>>(),
};

store.trendingWishes = [...store.wishes.values()].sort(
  (a, b) => b.likeCount + b.viewCount - (a.likeCount + a.viewCount),
);

export function siteUrl(slug: string): string {
  if (process.env.NODE_ENV === "development") {
    return `${process.env.LOCAL_SITE_PROXY ?? "http://localhost:3001/sites"}/${slug}/`;
  }
  return `https://${slug}.vibeking.dev/`;
}

export function createSession(userId: string): Session {
  const session: Session = {
    id: randomUUID(),
    userId,
    createdAt: now(),
  };
  store.sessions.set(session.id, session);
  return session;
}

export function getUserFromSession(sessionId: string | undefined): User | null {
  if (!sessionId) return null;
  const session = store.sessions.get(sessionId);
  if (!session) return null;
  return store.users.get(session.userId) ?? null;
}

export function createApiKey(
  userId: string,
  name: string,
  scopes: ApiKeyScope[],
): ApiKeyCreated {
  const id = randomUUID();
  const suffix = Math.random().toString(36).slice(2, 6);
  const key = `vk_${randomUUID().replace(/-/g, "")}${suffix}`;
  const apiKey: ApiKeyCreated = {
    id,
    name,
    keySuffix: suffix,
    scopes,
    createdAt: now(),
    lastUsedAt: null,
    current: true,
    key,
  };
  store.apiKeys.set(id, { ...apiKey, userId, keyHash: key });
  return apiKey;
}

export function listApiKeys(userId: string): ApiKey[] {
  return [...store.apiKeys.values()]
    .filter((k) => k.userId === userId)
    .map(({ userId: _u, keyHash: _h, ...key }) => key);
}