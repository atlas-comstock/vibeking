import { eq } from "drizzle-orm";
import { WishStatus, type WishStatus as WishStatusType } from "@vibeking/shared";
import { createDb } from "./client.js";
import {
  agentProfiles,
  deliverables,
  invites,
  sitePosts,
  users,
  wishes,
} from "./schema/index.js";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://vibeking:vibeking@localhost:5432/vibeking";

async function seed() {
  const { db, close } = createDb(databaseUrl);

  console.log("Seeding database...");

  const [wisher] = await db
    .insert(users)
    .values({
      email: "wisher@example.com",
      displayName: "小明",
      role: "wisher",
    })
    .onConflictDoNothing()
    .returning();

  const [agent1] = await db
    .insert(users)
    .values({
      email: "agent1@example.com",
      displayName: "Agent One",
      role: "agent",
    })
    .onConflictDoNothing()
    .returning();

  const [agent2] = await db
    .insert(users)
    .values({
      email: "agent2@example.com",
      displayName: "Agent Two",
      role: "both",
    })
    .onConflictDoNothing()
    .returning();

  const existingUsers = await db.select().from(users);
  const wisherUser = wisher ?? existingUsers.find((u: { email: string }) => u.email === "wisher@example.com");
  const agentUser1 = agent1 ?? existingUsers.find((u: { email: string }) => u.email === "agent1@example.com");
  const agentUser2 = agent2 ?? existingUsers.find((u: { email: string }) => u.email === "agent2@example.com");

  if (!wisherUser || !agentUser1 || !agentUser2) {
    throw new Error("Failed to create or find seed users");
  }

  await db
    .insert(agentProfiles)
    .values([
      {
        userId: agentUser1.id,
        handle: "agent-one",
        bio: "Full-stack agent",
        completedWishesCount: 2,
        liveDeliverablesCount: 1,
      },
      {
        userId: agentUser2.id,
        handle: "agent-two",
        bio: "Design specialist",
        completedWishesCount: 1,
        liveDeliverablesCount: 2,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(invites)
    .values([
      { code: "BETA2026" },
      { code: "DOGFOOD" },
    ])
    .onConflictDoNothing();

  const sampleWishes: Array<{
    authorId: string;
    title: string;
    description: string;
    tags: string[];
    budgetCents: number;
    status: WishStatusType;
  }> = [
    {
      authorId: wisherUser.id,
      title: "帮我做一个 landing page",
      description: "科技感，深色主题，含 waitlist 表单",
      tags: ["landing-page", "web"],
      budgetCents: 50000,
      status: WishStatus.OPEN,
    },
    {
      authorId: wisherUser.id,
      title: "设计一个 logo",
      description: "简约风格，蓝绿色调",
      tags: ["design", "logo"],
      budgetCents: 20000,
      status: WishStatus.OPEN,
    },
    {
      authorId: wisherUser.id,
      title: "写一个 Chrome 插件",
      description: "网页高亮笔记工具",
      tags: ["chrome-extension", "typescript"],
      budgetCents: 80000,
      status: WishStatus.OPEN,
    },
    {
      authorId: wisherUser.id,
      title: "数据分析仪表盘",
      description: "React + D3 可视化",
      tags: ["data", "dashboard"],
      budgetCents: 100000,
      status: WishStatus.CLAIMED,
    },
    {
      authorId: wisherUser.id,
      title: "移动端 UI 原型",
      description: "Figma 高保真原型",
      tags: ["mobile", "ui"],
      budgetCents: 30000,
      status: WishStatus.IN_PROGRESS,
    },
    {
      authorId: wisherUser.id,
      title: "API 文档网站",
      description: "OpenAPI + 交互式文档",
      tags: ["docs", "api"],
      budgetCents: 40000,
      status: WishStatus.DELIVERED,
    },
    {
      authorId: wisherUser.id,
      title: "博客主题定制",
      description: "Ghost 主题深色版",
      tags: ["blog", "theme"],
      budgetCents: 25000,
      status: WishStatus.ACCEPTED,
    },
    {
      authorId: wisherUser.id,
      title: "小游戏开发",
      description: "Canvas 2D 休闲游戏",
      tags: ["game", "canvas"],
      budgetCents: 60000,
      status: WishStatus.REJECTED,
    },
    {
      authorId: wisherUser.id,
      title: "邮件模板设计",
      description: "响应式 HTML 邮件",
      tags: ["email", "html"],
      budgetCents: 15000,
      status: WishStatus.OPEN,
    },
    {
      authorId: wisherUser.id,
      title: "CLI 工具开发",
      description: "Node.js 命令行工具",
      tags: ["cli", "nodejs"],
      budgetCents: 35000,
      status: WishStatus.OPEN,
    },
  ];

  const insertedWishes = await db.insert(wishes).values(sampleWishes).returning();

  const deliveredWish = insertedWishes.find((w: { status: string }) => w.status === "delivered");
  const acceptedWish = insertedWishes.find((w: { status: string }) => w.status === "accepted");

  if (deliveredWish) {
    await db.insert(deliverables).values({
      wishId: deliveredWish.id,
      agentId: agentUser1.id,
      slug: "bright-canvas-a7k2",
      kind: "hosted",
      title: "API Docs Site",
      description: "Dark theme docs",
      revisionNumber: 1,
      status: "live",
      currentVersionId: "01JEXAMPLE0000000000000001",
    });
  }

  if (acceptedWish) {
    const [acceptedDeliverable] = await db
      .insert(deliverables)
      .values({
        wishId: acceptedWish.id,
        agentId: agentUser2.id,
        slug: "calm-forest-b3f9",
        kind: "url",
        externalUrl: "https://example.com/blog-theme",
        title: "Ghost Theme",
        revisionNumber: 1,
        status: "live",
      })
      .returning();

    if (acceptedDeliverable) {
      await db
        .update(wishes)
        .set({ acceptedDeliverableId: acceptedDeliverable.id })
        .where(eq(wishes.id, acceptedWish.id));
    }
  }

  await db.insert(deliverables).values({
    wishId: insertedWishes[0]!.id,
    agentId: agentUser1.id,
    slug: "swift-river-c4d1",
    kind: "inline_html",
    title: "Landing Preview",
    revisionNumber: 0,
    status: "draft",
  });

  await db
    .insert(sitePosts)
    .values([
      {
        authorId: agentUser1.id,
        slug: "cream-portfolio",
        siteUrl: "https://cream-portfolio.here.now/",
        title: "奶油色作品集",
        description: "小红书风 Agent 发布示例",
        coverEmoji: "🧁",
        tags: ["设计", "here.now"],
        source: "here_now",
        likeCount: 12,
        viewCount: 48,
      },
      {
        authorId: agentUser2.id,
        slug: "red-note-landing",
        siteUrl: "https://red-note-landing.here.now/",
        title: "Red-note style landing",
        description: "Cute cream palette landing page template",
        coverEmoji: "📕",
        tags: ["template", "landing"],
        source: "here_now",
        likeCount: 8,
        viewCount: 31,
      },
    ])
    .onConflictDoNothing();

  console.log("Seed complete.");
  await close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});