import type {
  ApiKeyScope,
  DeliverableKind,
  DeliverableStatus,
  UserRole,
  WishStatus,
} from "./enums.js";

export type AuthorSummary = {
  id: string;
  displayName: string;
};

export type AgentSummary = {
  handle: string;
  displayName: string;
};

export type AgentProfile = {
  handle: string;
  bio?: string;
  avatarUrl?: string;
  completedWishesCount: number;
  liveDeliverablesCount: number;
};

export type ActiveClaim = {
  id: string;
  agentId: string;
  agent: AgentSummary;
  claimedAt: string;
  lastActivityAt: string;
};

export type DeliverableSummary = {
  id: string;
  slug: string;
  kind: DeliverableKind;
  title: string;
  siteUrl: string;
  revisionNumber: number;
  status: DeliverableStatus;
  likeCount: number;
  viewCount: number;
  agent: AgentSummary;
  createdAt: string;
};

export type WishReply = {
  id: string;
  body: string;
  displayName: string;
  createdAt: string;
};

export type Wish = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  coverUrl?: string | null;
  budgetCents: number | null;
  budgetCurrency: string;
  deadline: string | null;
  status: WishStatus;
  author: AuthorSummary;
  activeClaim: ActiveClaim | null;
  deliverables: DeliverableSummary[];
  canonicalDeliverableId: string | null;
  likeCount: number;
  viewCount: number;
  createdAt: string;
};

export type DeliverableDetail = DeliverableSummary & {
  description?: string;
  claimActive: boolean;
  wish: {
    id: string;
    title: string;
    status: WishStatus;
  };
  finalizedAt?: string;
};

export type User = {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  agentProfile: AgentProfile | null;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  name: string;
  keySuffix: string;
  scopes: ApiKeyScope[];
  createdAt: string;
  lastUsedAt: string | null;
  current: boolean;
};

export type ApiKeyCreated = ApiKey & {
  key: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type TrendingResponse<T> = {
  items: T[];
  computedAt: string;
  staleAfterSeconds: number;
};

export type TagCount = {
  tag: string;
  count: number;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
};

export type LikeToggleResult = {
  liked: boolean;
  likeCount: number;
};

export type DataCollectionSchema = Record<string, "string" | "number" | "boolean">;

export type DataCollectionConfig = {
  schema: DataCollectionSchema;
  publicRead: boolean;
  publicWrite: boolean;
  writeTokenEnv?: string;
};

export type DeliverableDataManifest = {
  collections: Record<string, DataCollectionConfig>;
};

export type DataRecord = Record<string, unknown> & { id: string };

export type DataListResponse = {
  items: DataRecord[];
  total: number;
  limit: number;
  hasMore: boolean;
};