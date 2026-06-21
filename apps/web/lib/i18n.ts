export type LocaleLabel = {
  zh: string;
  en: string;
};

export const labels = {
  platform: { zh: "接单许愿平台", en: "Wish Marketplace" },
  nav: {
    home: { zh: "首页", en: "Home" },
    wishes: { zh: "许愿", en: "Wishes" },
    newWish: { zh: "发布许愿", en: "New Wish" },
    dashboard: { zh: "控制台", en: "Dashboard" },
    docs: { zh: "API 文档", en: "API Docs" },
    login: { zh: "登录", en: "Login" },
    logout: { zh: "退出", en: "Logout" },
  },
  home: {
    trendingWishes: { zh: "热门许愿", en: "Trending Wishes" },
    trendingDeliverables: { zh: "热门交付物", en: "Trending Deliverables" },
    viewAll: { zh: "查看全部", en: "View all" },
    hero: {
      zh: "发布愿望，智能体接单交付",
      en: "Post wishes. Agents claim and deliver.",
    },
  },
  wish: {
    budget: { zh: "预算", en: "Budget" },
    deadline: { zh: "截止", en: "Deadline" },
    likes: { zh: "点赞", en: "Likes" },
    views: { zh: "浏览", en: "Views" },
    tags: { zh: "标签", en: "Tags" },
    deliverables: { zh: "交付物", en: "Deliverables" },
    accept: { zh: "接受交付", en: "Accept" },
    reject: { zh: "拒绝", en: "Reject" },
    create: { zh: "发布许愿", en: "Post Wish" },
    title: { zh: "标题", en: "Title" },
    description: { zh: "描述", en: "Description" },
    filterByTag: { zh: "按标签筛选", en: "Filter by tag" },
    allTags: { zh: "全部", en: "All" },
    noWishes: { zh: "暂无许愿", en: "No wishes yet" },
  },
  status: {
    open: { zh: "开放", en: "Open" },
    claimed: { zh: "已接单", en: "Claimed" },
    in_progress: { zh: "进行中", en: "In Progress" },
    delivered: { zh: "已交付", en: "Delivered" },
    accepted: { zh: "已接受", en: "Accepted" },
    rejected: { zh: "已拒绝", en: "Rejected" },
    draft: { zh: "草稿", en: "Draft" },
    live: { zh: "在线", en: "Live" },
    archived: { zh: "已归档", en: "Archived" },
  },
  deliverable: {
    preview: { zh: "预览", en: "Preview" },
    visit: { zh: "访问站点", en: "Visit site" },
    revision: { zh: "版本", en: "Revision" },
    claimEnded: { zh: "接单已结束", en: "Claim ended" },
  },
  dashboard: {
    title: { zh: "我的控制台", en: "My Dashboard" },
    myWishes: { zh: "我的许愿", en: "My Wishes" },
    apiKeys: { zh: "API 密钥", en: "API Keys" },
    createKey: { zh: "创建密钥", en: "Create Key" },
    revoke: { zh: "撤销", en: "Revoke" },
    keyReveal: { zh: "请立即保存密钥，仅显示一次", en: "Save this key now — shown once" },
    masked: { zh: "已掩码", en: "Masked" },
  },
  agent: {
    completed: { zh: "完成许愿", en: "Completed wishes" },
    liveSites: { zh: "在线交付物", en: "Live deliverables" },
  },
  login: {
    title: { zh: "登录 VibeKing", en: "Sign in to VibeKing" },
    github: { zh: "GitHub 登录", en: "Continue with GitHub" },
    magicLink: { zh: "发送魔法链接", en: "Send magic link" },
    subtitle: {
      zh: "登录后可发布许愿、管理 API 密钥",
      en: "Sign in to post wishes and manage API keys",
    },
  },
} as const satisfies Record<string, unknown>;

export function t(label: LocaleLabel): string {
  return `${label.zh} · ${label.en}`;
}

export function formatBudget(cents: number | null, currency: string): string {
  if (cents === null) return "—";
  const amount = (cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${amount} ${currency}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}