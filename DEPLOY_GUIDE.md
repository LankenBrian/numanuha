# BG Remover Pro - Cloudflare Pages 部署指南

## ✅ 构建成功

项目已成功构建，现在可以部署到 Cloudflare Pages。

## 📋 部署步骤

### 1. 环境变量设置

在 Cloudflare Pages 部署前，需要设置以下环境变量：

```bash
# 必需
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-project.pages.dev
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
REMOVE_BG_API_KEY=your-remove-bg-api-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# 可选
FAL_API_KEY=your-fal-api-key
```

### 2. 部署方式

#### 方式 A: GitHub 集成（推荐）

1. 推送代码到 GitHub 仓库
2. 登录 Cloudflare Dashboard
3. 进入 Pages → Create a project
4. 选择 Connect to Git
5. 选择你的 GitHub 仓库
6. 配置构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/`

#### 方式 B: Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
npx wrangler pages deploy .next
```

### 3. 数据库迁移

在部署后，需要在本地运行数据库迁移：

```bash
npx prisma migrate deploy
```

### 4. Stripe Webhook 配置

更新 Stripe Webhook URL:
```
https://your-project.pages.dev/api/stripe/webhook
```

需要监听的事件：
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `customer.subscription.deleted`

## 🔧 重要变更说明

### 认证系统
- 从 NextAuth v4 迁移到自定义 JWT 认证
- 使用 `jose` 库进行 JWT 签名和验证
- Session 存储在 `auth-token` cookie 中

### 数据库
- 使用 Prisma + Neon PostgreSQL
- Edge Runtime 兼容的 `@prisma/adapter-neon`

### API 路由
- 所有 API 路由使用 Edge Runtime
- `export const runtime = 'edge'`

## 🐛 已知问题

1. **metadataBase 警告**: 不影响功能，可以忽略
2. **Edge Runtime 警告**: 预期行为，Edge 路由不支持静态生成

## 📊 费用对比

| 项目 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| 带宽 | 100GB/月 | **无限** |
| 构建次数 | 6000/月 | 500/月 |
| Functions | Serverless | Edge (更快) |

## 🚀 部署后检查清单

- [ ] 网站可以正常访问
- [ ] 用户注册/登录功能正常
- [ ] 背景移除功能正常
- [ ] Stripe 支付流程正常
- [ ] 邮件发送正常
- [ ] 推荐系统正常

## 📞 支持

如有问题，请检查：
1. 环境变量是否正确设置
2. 数据库连接是否正常
3. Stripe Webhook 是否配置正确
