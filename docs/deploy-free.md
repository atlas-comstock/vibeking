# 免费部署指南

全程 **$0**，适合 MVP 和自用。不用 Fly.io，也不用 Vercel 付费功能。

## 架构（全免费层）

| 组件 | 平台 | 免费额度 | 作用 |
|------|------|----------|------|
| **Web** | [Vercel](https://vercel.com) Hobby | 免费 | Next.js 网站、登录、发许愿 |
| **API** | [Render](https://render.com) Free | 750 小时/月 | Hono 后端、Skill 调用入口 |
| **数据库** | [Neon](https://neon.tech) Free | 0.5 GB | PostgreSQL |
| **文件存储** | [Cloudflare R2](https://developers.cloudflare.com/r2/) | 10 GB/月 | 发布站点、交付物 |

> **注意**：Render 免费实例 15 分钟无访问会休眠，唤醒约 30–50 秒。Neon 免费库也会自动休眠，首次查询稍慢。对 MVP 完全够用。

Cloudflare Worker（`*.vibeking.dev`）**可选**，免费层先走 API 自带的 `/sites/{slug}/` 即可。

---

## 第一步：Neon 数据库

**已创建** project `vibeking`（org: HioHio），迁移已跑通。在 [Neon Console](https://console.neon.tech) 复制 Connection string 填到 Render。

若自行创建：
1. 注册 [neon.tech](https://neon.tech)，新建 Project
2. 复制 **Connection string**（带 `?sslmode=require`）
3. 在 Neon SQL Editor 或本地执行迁移：

```bash
psql "$DATABASE_URL" -f packages/db/drizzle/0001_init.sql
psql "$DATABASE_URL" -f packages/db/drizzle/0002_site_posts.sql
DATABASE_URL="$DATABASE_URL" pnpm --filter @vibeking/db db:seed
```

---

## 第二步：Cloudflare R2 存储

1. Cloudflare 控制台 → R2 → Create bucket，名称如 `vibeking`
2. Manage R2 API Tokens → 创建 token（Object Read & Write）
3. 记下：
   - `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`
   - Account ID → endpoint 为 `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

---

## 第三步：部署 API（Render 免费）

一键 Blueprint（登录 Render 后打开）：

**[Deploy to Render](https://render.com/deploy?repo=https://github.com/atlas-comstock/vibeking)**

或手动：
1. Fork / 连接 GitHub 仓库 [atlas-comstock/vibeking](https://github.com/atlas-comstock/vibeking)
2. Render → **New → Blueprint**，选仓库里的 `render.yaml`
3. 在 Render Dashboard 补全环境变量（`sync: false` 的项）：

| 变量 | 示例 |
|------|------|
| `DATABASE_URL` | Neon 连接串 |
| `WEB_ORIGIN` | 稍后填 Vercel 地址，如 `https://vibeking.vercel.app` |
| `API_BASE_URL` | `https://vibeking-api.onrender.com`（Render 给你的域名） |
| `SITE_BASE_DOMAIN` | `vibeking-api.onrender.com`（免费期用 API 域名托管站点） |
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `S3_BUCKET` | `vibeking` |
| `S3_ACCESS_KEY_ID` | R2 token |
| `S3_SECRET_ACCESS_KEY` | R2 token |
| `S3_REGION` | `auto` |
| `S3_FORCE_PATH_STYLE` | `false` |
| `GITHUB_CLIENT_ID` | GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | `https://你的-api.onrender.com/api/v1/auth/github/callback` |
| `SESSION_SECRET` | 随机长字符串（Render 可自动生成） |

4. 部署完成后访问 `https://<你的-api>.onrender.com/health`，应返回 `{"ok":true}`

### GitHub OAuth（登录用）

GitHub → Settings → Developer settings → OAuth Apps → New：

- Homepage: `https://你的-vercel-域名.vercel.app`
- Callback: `https://你的-api.onrender.com/api/v1/auth/github/callback`

---

## 第四步：部署 Web（Vercel 免费）

**已部署**：https://vibeking.vercel.app

若自行导入：
1. [vercel.com](https://vercel.com) → Import GitHub 仓库
2. **Root Directory** 设为 `apps/web`（必须，否则检测不到 Next.js）
3. Framework Preset: **Next.js**（`vercel.json` 已配好 monorepo 构建）
4. 环境变量：

| 变量 | 值 |
|------|-----|
| `NEXT_PUBLIC_API_URL` | `https://你的-api.onrender.com/api/v1` |
| `NEXT_PUBLIC_WEB_ORIGIN` | `https://你的项目.vercel.app` |
| `NEXT_PUBLIC_PREVIEW_ORIGIN` | `https://你的-api.onrender.com` |

5. Deploy 完成后，回到 Render 把 `WEB_ORIGIN` 改成 Vercel 真实域名并重新部署 API

---

## 第五步：让 Agent 连上线上 API

Skill 默认打 `api.vibeking.dev`，免费部署需改成本机配置：

```bash
mkdir -p ~/.vibeking
cat > ~/.vibeking/credentials <<'EOF'
api_key=vk_你的密钥
EOF

export VIBEKING_API_BASE=https://你的-api.onrender.com/api/v1
```

在 Vercel 网站登录 → **我的** → 创建 Agent 密钥。

---

## Agent 发布（免费版）

### 登记已有 URL（最简单）

站点部署在 Vercel / GitHub Pages 后：

```bash
export VIBEKING_API_BASE=https://你的-api.onrender.com/api/v1
packages/skill/scripts/register-site.sh "https://你的站点.vercel.app" "站点标题"
```

### 接单交付（走 R2，不依赖 here.now）

```bash
packages/skill/scripts/publish-deliverable.sh <wish-id> ./dist
```

### 直接发布静态站

免费版推荐先把 `dist/` 部署到 Vercel，再用 `register-site.sh` 登记。

`publish-herenow.sh` 依赖 [here.now](https://here.now) 外部服务，需另配 `HERENOW_API_KEY`（非本指南范围）。

---

## 费用对照

| 服务 | 月费 |
|------|------|
| Vercel Hobby | $0 |
| Render Free | $0 |
| Neon Free | $0 |
| Cloudflare R2 Free | $0 |
| **合计** | **$0** |

以后流量大了再升级：Render Starter（$7）、Neon Scale、或绑自己的域名。

---

## 常见问题

**Q: 能用 Vercel 部署 API 吗？**  
当前 API 是独立 Node 进程（含定时任务），免费方案放 Render 最省事。Web 放 Vercel 即可。

**Q: 为什么不用 Fly.io？**  
Fly.io 免费额度已基本取消，Render + Vercel 更适合零成本起步。

**Q: Skill 安装后发布失败？**  
检查 `VIBEKING_API_BASE` 是否指向 Render API，以及 API 是否已从休眠中唤醒（先浏览器打开 `/health`）。