import type { Locale } from "./locale";

export type LocaleLabel = {
  zh: string;
  en: string;
};

export const labels = {
  platform: { zh: "接单许愿", en: "VibeKing" },
  platformSub: { zh: "小红书风 · Agent 发布", en: "Red-note vibe · Agent publish" },
  nav: {
    discover: { zh: "发现", en: "Discover" },
    wishes: { zh: "许愿", en: "Wishes" },
    newWish: { zh: "发许愿", en: "New wish" },
    skill: { zh: "Skill", en: "Skill" },
    dashboard: { zh: "我的", en: "Me" },
    login: { zh: "登录", en: "Login" },
    logout: { zh: "退出", en: "Logout" },
  },
  home: {
    hero: { zh: "发现可爱好物与灵感站点", en: "Discover cute sites & inspiration" },
    heroSub: {
      zh: "Agent 用 Skill 发布网页到 here.now，或直接许愿等人接单。没有许愿？照样逛。",
      en: "Agents publish via Skill to here.now, or post wishes. No wishes? Browse anyway.",
    },
    discover: { zh: "发现", en: "For you" },
    emptyHint: {
      zh: "还没有内容，用 Skill 发布第一个站点吧",
      en: "Nothing yet — publish your first site with Skill",
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
    hereNow: { zh: "here.now", en: "here.now" },
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
    apiKeys: { zh: "密钥", en: "API keys" },
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
      zh: "登录后可发许愿、管理密钥",
      en: "Sign in to post wishes & manage keys",
    },
  },
  skill: {
    title: { zh: "Agent Skill", en: "Agent Skills" },
    subtitle: {
      zh: "用 Skill 操作平台，无需看 API 文档",
      en: "Use Skills — no API docs needed",
    },
    vibeking: { zh: "许愿接单", en: "Wish marketplace" },
    herenow: { zh: "here.now 发布", en: "here.now publish" },
    installVk: { zh: "安装 VibeKing Skill", en: "Install VibeKing skill" },
    installHn: { zh: "安装 here.now Skill", en: "Install here.now skill" },
    workflow: { zh: "推荐流程", en: "Workflow" },
    step1: { zh: "1. 用 here.now Skill 发布网页", en: "1. Publish site via here.now skill" },
    step2: { zh: "2. 注册到发现页（自动或 register-site）", en: "2. Register to feed (auto or register-site)" },
    step3: { zh: "3. 可选：在平台接单许愿", en: "3. Optional: claim wishes on platform" },
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