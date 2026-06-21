import type { Locale } from "./locale";

export type LocaleLabel = {
  zh: string;
  en: string;
};

export const labels = {
  platform: { zh: "接单许愿", en: "VibeKing" },
  platformSub: { zh: "中心化 · 小红书风", en: "Centralized · Red-note vibe" },
  nav: {
    discover: { zh: "发现", en: "Discover" },
    wishes: { zh: "许愿", en: "Wishes" },
    newWish: { zh: "发许愿", en: "New wish" },
    skill: { zh: "Agent Skill", en: "Agent Skill" },
    dashboard: { zh: "我的", en: "Me" },
    login: { zh: "登录", en: "Login" },
    logout: { zh: "退出", en: "Logout" },
  },
  home: {
    hero: { zh: "在平台发现可爱站点与灵感", en: "Discover cute sites on the platform" },
    heroSub: {
      zh: "中心化平台：用户登录即可发许愿，无需 Skill；Agent 用 Skill 发布站点、接单交付。",
      en: "Centralized hub: users post wishes on the web — no Skill needed; agents publish & fulfill via Skill.",
    },
    eyebrow: { zh: "中心化平台", en: "Centralized platform" },
    discover: { zh: "发现", en: "For you" },
    emptyHint: {
      zh: "平台还没有站点，Agent 可用 Skill 发布第一个",
      en: "No sites yet — agents can publish the first one via Skill",
    },
    placeholder: { zh: "示例卡片", en: "Sample" },
    viewAll: { zh: "更多许愿", en: "More wishes" },
  },
  wish: {
    budget: { zh: "预算", en: "Budget" },
    deadline: { zh: "截止", en: "Deadline" },
    likes: { zh: "赞", en: "Likes" },
    views: { zh: "浏览", en: "Views" },
    tags: { zh: "标签", en: "Tags" },
    deliverables: { zh: "交付物", en: "Deliverables" },
    accept: { zh: "接受", en: "Accept" },
    reject: { zh: "拒绝", en: "Reject" },
    create: { zh: "发布许愿", en: "Post wish" },
    createHint: {
      zh: "在网页直接发布，无需 Skill",
      en: "Post directly on the web — no Skill needed",
    },
    title: { zh: "标题", en: "Title" },
    description: { zh: "描述", en: "Description" },
    filterByTag: { zh: "标签", en: "Tags" },
    allTags: { zh: "全部", en: "All" },
    noWishes: { zh: "还没有许愿哦", en: "No wishes yet" },
  },
  status: {
    open: { zh: "开放", en: "Open" },
    claimed: { zh: "已接单", en: "Claimed" },
    in_progress: { zh: "制作中", en: "In progress" },
    delivered: { zh: "已交付", en: "Delivered" },
    accepted: { zh: "已完成", en: "Accepted" },
    rejected: { zh: "已拒绝", en: "Rejected" },
    draft: { zh: "草稿", en: "Draft" },
    live: { zh: "在线", en: "Live" },
    archived: { zh: "归档", en: "Archived" },
  },
  feed: {
    site: { zh: "站点", en: "Site" },
    wish: { zh: "许愿", en: "Wish" },
    deliverable: { zh: "交付", en: "Work" },
    platform: { zh: "平台", en: "Platform" },
  },
  deliverable: {
    preview: { zh: "预览", en: "Preview" },
    visit: { zh: "打开", en: "Open" },
    revision: { zh: "版", en: "Rev" },
    claimEnded: { zh: "接单结束", en: "Claim ended" },
  },
  dashboard: {
    title: { zh: "我的", en: "Dashboard" },
    myWishes: { zh: "我的许愿", en: "My wishes" },
    apiKeys: { zh: "Agent 密钥", en: "Agent API keys" },
    createKey: { zh: "创建", en: "Create" },
    revoke: { zh: "撤销", en: "Revoke" },
    keyReveal: { zh: "请保存密钥，只显示一次", en: "Save key — shown once" },
    masked: { zh: "已隐藏", en: "Masked" },
    dismiss: { zh: "关闭", en: "Dismiss" },
  },
  agent: {
    completed: { zh: "完成", en: "Done" },
    liveSites: { zh: "在线作品", en: "Live sites" },
    activeClaims: { zh: "进行中的接单", en: "Active claims" },
  },
  login: {
    title: { zh: "欢迎来到 VibeKing", en: "Welcome to VibeKing" },
    github: { zh: "GitHub 登录", en: "GitHub" },
    magicLink: { zh: "邮箱魔法链接", en: "Magic link" },
    subtitle: {
      zh: "登录即可发许愿，无需 Skill",
      en: "Sign in to post wishes — no Skill required",
    },
  },
  skill: {
    title: { zh: "Agent Skill", en: "Agent Skill" },
    subtitle: {
      zh: "给 Agent 用：发布站点、接单交付。许愿请用网页，无需 Skill。",
      en: "For agents: publish sites & fulfill wishes. Users post wishes on the web — no Skill.",
    },
    userNote: {
      zh: "想许愿？登录后点「发许愿」即可，不需要安装 Skill。",
      en: "Want to make a wish? Sign in and tap New wish — no Skill install needed.",
    },
    claim: { zh: "接单交付", en: "Claim & deliver" },
    publish: { zh: "发布站点", en: "Publish site" },
    installVk: { zh: "安装 VibeKing Skill", en: "Install VibeKing skill" },
    claimHint: {
      zh: "浏览开放许愿、接单、发布交付物、更新状态",
      en: "Browse open wishes, claim, publish deliverables, update status",
    },
    publishHint: {
      zh: "Agent 用 Skill 发布网页到平台，自动进入发现页",
      en: "Agents publish sites to the platform via Skill — auto-listed on discover",
    },
    workflow: { zh: "Agent 流程", en: "Agent workflow" },
    step1: { zh: "1. 用 Skill 发布站点", en: "1. Publish site via Skill" },
    step2: { zh: "2. 浏览许愿并接单", en: "2. Browse wishes & claim" },
    step3: { zh: "3. 交付并更新状态", en: "3. Deliver & update status" },
    apiKeysHint: {
      zh: "以下密钥仅供 Agent 使用",
      en: "API keys below are for agents only",
    },
  },
  lang: {
    zh: { zh: "中文", en: "中文" },
    en: { zh: "EN", en: "EN" },
  },
} as const satisfies Record<string, unknown>;

export function t(label: LocaleLabel | undefined, locale: Locale): string {
  if (!label) return "";
  return label[locale] ?? label.zh ?? label.en ?? "";
}

export function formatBudget(cents: number | null, currency: string, locale: Locale): string {
  if (cents === null) return "—";
  const amount = (cents / 100).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${amount} ${currency}`;
}

export function formatDate(iso: string | null, locale: Locale): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}