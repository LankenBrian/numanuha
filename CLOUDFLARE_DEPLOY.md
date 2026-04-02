# Cloudflare Pages 部署指南

> BG Remover Pro 迁移到 Cloudflare Pages 的完整指南

## 📋 前置要求

1. **Cloudflare 账号**: 注册 [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Cloudflare 命令行工具
3. **GitHub 仓库**: 代码托管
4. **Neon 数据库**: 已创建的 PostgreSQL 数据库

---

## 🚀 快速部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 设置环境变量

```bash
# 必需变量
wrangler secret put NEXTAUTH_SECRET
wrangler secret put DATABASE_URL
wrangler secret put REMOVE_BG_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put STRIPE_PRICE_ID_PRO
wrangler secret put RESEND_API_KEY
wrangler secret put FROM_EMAIL

# 可选变量
wrangler secret put FAL_API_KEY
```

### 4. 运行部署脚本

```bash
# Windows
./deploy-cloudflare-pages.bat

# 或手动执行
npm install
npx prisma generate
npm run pages:build
wrangler pages deploy .vercel/output/static
```

---

## ⚙️ 详细配置说明

### 数据库配置

项目使用 **Neon PostgreSQL**，需要确保：

1. **DATABASE_URL** 格式正确：
   ```
   postgresql://username:password@hostname/database?sslmode=require
   ```

2. **数据库迁移** (在本地执行):
   ```bash
   npx prisma migrate deploy
   ```

### NextAuth 配置

Edge Runtime 已适配，需要注意：

1. **NEXTAUTH_SECRET**: 使用以下命令生成
   ```bash
   openssl rand -base64 32
   ```

2. **NEXTAUTH_URL**: 部署后自动设置为 Pages 域名

### Stripe 配置

1. **更新 Webhook URL**:
   ```
   https://your-project.pages.dev/api/stripe/webhook
   ```

2. **配置 Webhook Events**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`

---

## 🔧 迁移变更说明

### 主要变更

| 组件 | 变更前 (Vercel) | 变更后 (Cloudflare Pages) |
|------|----------------|---------------------------|
| 运行时 | Node.js | Edge Runtime |
| Prisma 驱动 | 默认 | `@prisma/adapter-neon` |
| Auth 检查 | `getServerSession()` | `getToken()` (JWT) |
| 构建输出 | `.next` | `.vercel/output/static` |

### 文件修改

1. **prisma/schema.prisma**: 添加 `driverAdapters` preview feature
2. **src/lib/prisma.ts**: 适配 Neon serverless 驱动
3. **API Routes**: 添加 `export const runtime = 'edge'`
4. **next.config.js**: 添加 `output: 'standalone'`

---

## 🌐 GitHub 集成 (推荐)

### 设置自动部署

1. 在 Cloudflare Dashboard 创建 Pages 项目
2. 选择 **Connect to Git**
3. 选择 GitHub 仓库
4. 配置构建设置：
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`

### 环境变量

在 Cloudflare Dashboard → Pages → Project → Settings → Environment variables 中添加所有必需变量。

---

## ✅ 部署检查清单

- [ ] Wrangler CLI 已安装并登录
- [ ] 所有必需的环境变量已设置
- [ ] Neon 数据库已创建并迁移
- [ ] Stripe Webhook URL 已更新
- [ ] Resend 域名已验证
- [ ] 本地构建测试通过 (`npm run pages:build`)
- [ ] GitHub 仓库已连接 (如使用自动部署)

---

## 🐛 故障排除

### 构建失败

```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### 数据库连接失败

- 检查 `DATABASE_URL` 是否正确
- 确认 Neon 允许所有 IP 访问
- 测试连接：`npx prisma db pull`

### Stripe Webhook 失败

- 检查 Webhook URL 是否正确
- 确认 `STRIPE_WEBHOOK_SECRET` 已设置
- 查看 Cloudflare Pages Functions 日志

### 邮件发送失败

- 验证 Resend API key
- 检查 `FROM_EMAIL` 域名已在 Resend 验证
- 查看 Resend Dashboard 发送记录

---

## 📊 费用对比

| 项目 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| 带宽 | 100GB/月 (免费) | **无限** (免费) |
| 构建次数 | 6000/月 (免费) | 500/月 (免费) |
| Functions 调用 | 无限制 | 100,000/天 (免费) |
| 数据库 | Neon (免费) | Neon (免费) |

**结论**: Cloudflare Pages 更适合高流量场景，带宽无限制。

---

## 📞 支持

- **文档**: [PROJECT.md](./PROJECT.md)
- **部署脚本**: `deploy-cloudflare-pages.bat`
- **环境检查**: `node scripts/check-cloudflare-env.js`

---

## 🎉 完成!

部署完成后，访问你的 Cloudflare Pages 域名开始使用 BG Remover Pro!
