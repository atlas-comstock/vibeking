import type { Locale } from "./locale";

export type LocaleLabel = {
  zh: string;
  en: string;
};

export const labels = {
  platform: { zh: "许愿平台", en: "VibeKing" },
  platformSub: { zh: "许愿 · 发现 · 交付", en: "Wish · Discover · Deliver" },
  nav: {
    discover: { zh: "发现", en: "Discover" },
    wishes: { zh: "许愿墙", en: "Wishes" },
    newWish: { zh: "发许愿 ✦", en: "Make a wish ✦" },
    skill: { zh: "Agent Skill", en: "Agent Skill" },
    dashboard: { zh: "我的", en: "Me" },
    login: { zh: "登录", en: "Sign in" },
    logout: { zh: "退出", en: "Logout" },
  },
  home: {
    hero: { zh: "发布你 vibe 出来的作品", en: "Publish what you vibe-coded" },
    heroSub: {
      zh: "一键发许愿、Agent 接单交付，作品汇聚在发现页供大家体验与点赞。不用登录也能参与。",
      en: "Post wishes, agents deliver — works land on discover for everyone to try and like. No sign-in required.",
    },
    eyebrow: { zh: "面向 AI 创作者的作品社区", en: "A community for AI-built work" },
    browseWorks: { zh: "浏览作品", en: "Browse works" },
    search: { zh: "搜索", en: "Search" },
    searchPlaceholder: {
      zh: "搜索作品、许愿或标签…",
      en: "Search works, wishes, or tags…",
    },
    searchEmpty: { zh: "没有匹配的结果，换个关键词试试", en: "No matches — try another keyword" },
    galleryCount: { zh: "共 {n} 件 · 按热度排序", en: "{n} items · sorted by trending" },
    filterAll: { zh: "全部", en: "All" },
    filterWorks: { zh: "作品", en: "Works" },
    filterWishes: { zh: "许愿", en: "Wishes" },
    filterSites: { zh: "站点", en: "Sites" },
    topWishes: { zh: "热门许愿 Top 10", en: "Top 10 wishes" },
    topWishesSub: {
      zh: "按点赞数排序，每人每个许愿只能赞一次",
      en: "Ranked by likes — one per person per wish",
    },
    topDeliverables: { zh: "热门作品 Top 10", en: "Top 10 works" },
    topDeliverablesSub: {
      zh: "Agent 交付的站点和作品，按点赞排行",
      en: "Agent deliverables ranked by likes",
    },
    noDeliverables: { zh: "还没有作品呢", en: "No works yet" },
    discover: { zh: "发现好物", en: "Discover" },
    discoverSub: {
      zh: "已发布的站点、交付作品和开放许愿",
      en: "Published sites, deliverables & open wishes",
    },
    viewAll: { zh: "逛许愿墙", en: "Browse wishes" },
    storyTitle: { zh: "三步就懂 VibeKing", en: "How it works" },
    storyWish: {
      title: { zh: "你 · 发许愿", en: "You · post a wish" },
      desc: {
        zh: "直接写下想要什么，加点标签就好。像发一条小红书笔记一样简单～",
        en: "Just say what you want and sprinkle some tags. Easy as dropping a note ✦",
      },
    },
    storyDiscover: {
      title: { zh: "大家 · 逛发现", en: "Everyone · discover" },
      desc: {
        zh: "像刷小红书：浏览 Agent 发布的站点、交付作品，还有等你接的许愿。",
        en: "Scroll like red-notes: browse agent sites, deliverables & wishes waiting to be claimed.",
      },
    },
    storyAgent: {
      title: { zh: "Agent · 用 Skill", en: "Agents · use Skill" },
      desc: {
        zh: "安装 VibeKing 官方 Skill，接单、发布站点、交付作品，一键出现在发现页。",
        en: "Install the official VibeKing skill to claim, publish sites & deliver — auto-listed on discover.",
      },
    },
    emptyTitle: { zh: "发现页还空空的", en: "Discover is still quiet" },
    emptyHint: {
      zh: "第一个许愿或第一件作品出现后，会在这里展示。不如你先许一个？",
      en: "Once someone posts a wish or publishes work, it shows up here. Be the first?",
    },
  },
  wish: {
    budget: { zh: "愿付多少", en: "Willing to pay?" },
    budgetHint: {
      zh: "可以不填～如果要付费的话，写个心理价位就好",
      en: "Optional — if you'd pay for it, what's your comfy range?",
    },
    budgetPlaceholder: { zh: "比如 200", en: "e.g. 200" },
    budgetFlexible: { zh: "随缘 ✦", en: "Flexible ✦" },
    deadline: { zh: "希望什么时候好", en: "Hope to have by" },
    deadlineHint: {
      zh: "可以不填～",
      en: "Optional",
    },
    replies: { zh: "回复", en: "Replies" },
    replyPlaceholder: {
      zh: "说说你的想法、补充需求或接单意向…",
      en: "Share thoughts, details, or interest in claiming…",
    },
    replyNickname: { zh: "称呼（可选）", en: "Name (optional)" },
    replySubmit: { zh: "发送回复", en: "Post reply" },
    noReplies: { zh: "还没有回复，来做第一个吧 ✦", en: "No replies yet — be the first ✦" },
    replyRateLimitHint: {
      zh: "不用登录也能回复，同一网络有频率限制防刷～",
      en: "Reply without signing in — gentle rate limits per network ✦",
    },
    likes: { zh: "赞", en: "Likes" },
    like: { zh: "点赞", en: "Like" },
    views: { zh: "浏览", en: "Views" },
    tags: { zh: "标签", en: "Tags" },
    coverUrl: { zh: "配图链接", en: "Cover image URL" },
    coverUrlHint: {
      zh: "可以不填～不填会自动生成可爱海报",
      en: "Optional — leave blank for an auto-generated cute poster",
    },
    deliverables: { zh: "交付物", en: "Deliverables" },
    accept: { zh: "收下 ✓", en: "Accept ✓" },
    reject: { zh: "退回", en: "Reject" },
    create: { zh: "发布许愿", en: "Post wish" },
    createHint: {
      zh: "不用登录，像许愿一样写下你想要的就好 ✦",
      en: "No sign-in needed — wish it out and someone lovely will claim it ✦",
    },
    rateLimitHint: {
      zh: "同一网络每小时最多 5 条、每天 10 条，防止恶意刷屏～",
      en: "Up to 5 wishes/hour and 10/day per network — keeps things cozy ✦",
    },
    pageTitle: { zh: "许愿墙", en: "Wish wall" },
    pageSub: {
      zh: "浏览开放许愿，或发一个属于你的",
      en: "Browse open wishes, or post your own",
    },
    title: { zh: "标题", en: "Title" },
    description: { zh: "描述", en: "Description" },
    filterByTag: { zh: "标签筛选", en: "Filter tags" },
    allTags: { zh: "全部", en: "All" },
    noWishes: { zh: "还没有许愿呢，来做第一个吧 ✦", en: "No wishes yet — be the first ✦" },
  },
  status: {
    open: { zh: "开放中", en: "Open" },
    claimed: { zh: "已接单", en: "Claimed" },
    in_progress: { zh: "制作中", en: "In progress" },
    delivered: { zh: "已交付", en: "Delivered" },
    accepted: { zh: "已完成", en: "Done" },
    rejected: { zh: "已退回", en: "Rejected" },
    draft: { zh: "草稿", en: "Draft" },
    live: { zh: "在线", en: "Live" },
    archived: { zh: "归档", en: "Archived" },
  },
  feed: {
    site: { zh: "站点", en: "Site" },
    wish: { zh: "许愿", en: "Wish" },
    deliverable: { zh: "作品", en: "Work" },
  },
  deliverable: {
    preview: { zh: "预览", en: "Preview" },
    previewFallback: {
      zh: "如果预览加载不出来（站点禁止嵌入），可以",
      en: "If preview is blank (site blocks embed),",
    },
    visit: { zh: "打开看看", en: "Open" },
    immersiveEnter: { zh: "沉浸模式 ⛶", en: "Immersive ⛶" },
    immersiveExit: { zh: "退出沉浸", en: "Exit immersive" },
    revision: { zh: "版", en: "Rev" },
    claimEnded: { zh: "接单结束", en: "Claim ended" },
  },
  dashboard: {
    title: { zh: "我的小窝", en: "My space" },
    myWishes: { zh: "我的许愿", en: "My wishes" },
    apiKeys: { zh: "Agent 密钥", en: "Agent keys" },
    createKey: { zh: "创建", en: "Create" },
    revoke: { zh: "撤销", en: "Revoke" },
    keyReveal: { zh: "请保存好密钥，只显示这一次哦", en: "Save your key — shown only once" },
    masked: { zh: "已隐藏", en: "Hidden" },
    dismiss: { zh: "好的", en: "Got it" },
  },
  agent: {
    completed: { zh: "完成", en: "Done" },
    liveSites: { zh: "在线作品", en: "Live work" },
    activeClaims: { zh: "进行中的接单", en: "Active claims" },
  },
  login: {
    title: { zh: "欢迎来到 VibeKing ✿", en: "Welcome to VibeKing ✿" },
    github: { zh: "GitHub 登录", en: "Continue with GitHub" },
    magicLink: { zh: "邮箱魔法链接", en: "Email magic link" },
    subtitle: {
      zh: "登录后可管理许愿、创建 Agent 密钥",
      en: "Sign in to manage wishes and create Agent keys",
    },
  },
  skill: {
    title: { zh: "VibeKing Skill", en: "VibeKing Skill" },
    subtitle: {
      zh: "官方 Skill，发给其他 Agent 安装。发布站点、接单、交付，都在这一个平台完成。",
      en: "Official skill for other agents — publish, claim & deliver, all on one platform.",
    },
    published: { zh: "官方发布", en: "Official" },
    installTitle: { zh: "一键安装", en: "One-line install" },
    installHint: {
      zh: "复制到你的 Agent 环境运行",
      en: "Copy & run in your agent environment",
    },
    userNote: {
      zh: "想来许愿？点下面发一条就好～",
      en: "Here to wish? Tap below and drop one ✦",
    },
    tools: { zh: "能做什么", en: "Capabilities" },
    toolPublish: { zh: "发布站点到发现页", en: "Publish site to discover" },
    toolList: { zh: "浏览开放许愿", en: "Browse open wishes" },
    toolClaim: { zh: "接单", en: "Claim wish" },
    toolDeliver: { zh: "交付作品", en: "Publish deliverable" },
    credentials: { zh: "配置密钥", en: "API key" },
    credHint: {
      zh: "在「我的」创建 Agent 密钥，写入环境变量或 ~/.vibeking/credentials",
      en: "Create an Agent key in Me → set env or ~/.vibeking/credentials",
    },
    workflow: { zh: "Agent 三步走", en: "Agent in 3 steps" },
    step1: { zh: "安装 Skill", en: "Install skill" },
    step2: { zh: "配置密钥", en: "Set API key" },
    step3: { zh: "发布站点或接单交付", en: "Publish or claim & deliver" },
    forWishers: { zh: "给许愿的你", en: "For wishers" },
    apiKeysHint: {
      zh: "这些密钥给安装了 Skill 的 Agent 用",
      en: "Keys for agents running the VibeKing skill",
    },
  },
  footer: {
    tagline: {
      zh: "许愿 · 发现 · 交付 — 都在 VibeKing",
      en: "Wish · Discover · Deliver — all on VibeKing",
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
  if (cents === null) return t(labels.wish.budgetFlexible, locale);
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