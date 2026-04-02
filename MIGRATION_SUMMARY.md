# Cloudflare Pages 迁移完成总结

## ✅ 已完成的迁移工作

### 1. 核心配置更新

- [x] **next.config.js**: 添加 `output: 'standalone'` 和 Edge Runtime 配置
- [x] **wrangler.toml**: 更新 Cloudflare Pages 配置
- [x] **package.json**: 添加 `@prisma/adapter-neon` 依赖和部署脚本
- [x] **prisma/schema.prisma**: 添加 `driverAdapters` preview feature

### 2. 数据库适配

- [x] **src/lib/prisma.ts**: 重写为支持 Edge Runtime 的 Neon 适配器
  - 自动检测运行环境 (Node.js vs Edge)
  - 使用 `@prisma/adapter-neon` 进行数据库连接

### 3. API 路由 Edge Runtime 适配

- [x] **src/app/api/auth/[...nextauth]/route.ts**: 添加 `export const runtime = 'edge'`
- [x] **src/app/api/remove-bg/route.ts**: 
  - 添加 Edge Runtime 配置
  - 将 `getServerSession()` 替换为 `getToken()` (Edge 兼容)
- [x] **src/app/api/stripe/webhook/route.ts**:
  - 添加 Edge Runtime 配置
  - 将 `headers()` 替换为 `req.headers`
- [x] **src/app/api/auth/register/route.ts**: 添加 Edge Runtime 配置

### 4. 部署工具

- [x] **deploy-cloudflare-pages.bat**: Windows 部署脚本
- [x] **scripts/check-cloudflare-env.js**: 环境变量检查脚本
- [x] **CLOUDFLARE_DEPLOY.md**: 完整部署指南

---

## 📋 部署前检查清单

### 必需环境变量

通过 `wrangler secret put` 设置以下变量：

```bash
wrangler secret put NEXTAUTH_SECRET          # openssl rand -base64 32
wrangler secret put NEXTAUTH_URL             # https://your-project.pages.dev
wrangler secret put DATABASE_URL             # Neon PostgreSQL 连接字符串
wrangler secret put REMOVE_BG_API_KEY        # Remove.bg API Key
wrangler secret put STRIPE_SECRET_KEY        # Stripe Secret Key
wrangler secret put STRIPE_WEBHOOK_SECRET    # Stripe Webhook Secret
wrangler secret put STRIPE_PRICE_ID_PRO      # Stripe Pro 套餐 Price ID
wrangler secret put RESEND_API_KEY           # Resend API Key
wrangler secret put FROM_EMAIL               # 发件邮箱
```

### 可选环境变量

```bash
wrangler secret put FAL_API_KEY              # Fal.ai API Key (AI 背景生成)
```

---

## 🚀 部署步骤

### 方式一: 使用部署脚本 (推荐)

```bash
./deploy-cloudflare-pages.bat
```

### 方式二: 手动部署

```bash
# 1. 安装依赖
npm install

# 2. 生成 Prisma 客户端
npx prisma generate

# 3. 构建项目
npm run pages:build

# 4. 部署到 Cloudflare Pages
wrangler pages deploy .vercel/output/static
```

### 方式三: GitHub 自动集成

1. 在 Cloudflare Dashboard 创建 Pages 项目
2. 连接 GitHub 仓库
3. 设置构建设置:
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`

---

## ⚠️ 重要提醒

### 1. Stripe Webhook 更新

部署后需要更新 Stripe Webhook URL:

```
旧: https://your-project.vercel.app/api/stripe/webhook
新: https://your-project.pages.dev/api/stripe/webhook
```

### 2. 数据库迁移

如果数据库 schema 有变更，需要在本地执行:

```bash
npx prisma migrate deploy
```

### 3. 域名配置

如需使用自定义域名:
1. 在 Cloudflare Dashboard → Pages → Custom domains 添加域名
2. 更新 `NEXTAUTH_URL` 环境变量
3. 更新 Stripe Webhook URL

---

## 🔧 技术变更详情

### Prisma 适配器变更

**变更前 (Vercel - Node.js):**
```typescript
import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient()
```

**变更后 (Cloudflare Pages - Edge):**
```typescript
import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool)
export const prisma = new PrismaClient({ adapter })
```

### Auth 检查变更

**变更前:**
```typescript
import { getServerSession } from 'next-auth'
const session = await getServerSession()
```

**变更后:**
```typescript
import { getToken } from 'next-auth/jwt'
const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
```

---

## 📊 与 Vercel 对比

| 特性 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| 带宽 | 100GB/月 (免费) | **无限** (免费) |
| 构建次数 | 6000/月 (免费) | 500/月 (免费) |
| Functions | Serverless | Edge Runtime |
| 全球节点 | 100+ | 300+ |
| 数据库连接 | 直接 | 通过 Neon serverless |

---

## 🎯 下一步操作

1. **安装 Wrangler CLI**: `npm install -g wrangler`
2. **登录 Cloudflare**: `wrangler login`
3. **设置环境变量**: 使用 `wrangler secret put`
4. **运行部署**: `./deploy-cloudflare-pages.bat`
5. **更新 Stripe Webhook**: 在 Stripe Dashboard 更新 Webhook URL
6. **测试功能**: 验证所有核心功能正常工作

---

## 📞 问题排查

### 常见问题

1. **构建失败**: 检查 `npx prisma generate` 是否成功执行
2. **数据库连接失败**: 确认 `DATABASE_URL` 格式正确且 Neon 允许访问
3. **Auth 失败**: 确认 `NEXTAUTH_SECRET` 和 `NEXTAUTH_URL` 已设置
4. **Stripe Webhook 失败**: 确认 Webhook URL 和 Secret 正确

### 查看日志

```bash
wrangler pages deployment tail
```

---

**迁移完成时间**: 2026-04-02
**迁移者**: dev (开发小助理)
**项目**: BG Remover Pro
