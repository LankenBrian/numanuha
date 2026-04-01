# BG Remover Pro - 出海 SaaS 项目

> AI-powered background removal tool for e-commerce and creators

## 🚀 项目概述

BG Remover Pro 是一个面向海外市场的 AI 图片背景移除工具，采用 Freemium 商业模式，支持订阅付费、推荐奖励和联盟营销。

### 核心功能
- ✅ AI 背景移除（基于 Remove.bg API）
- ✅ 24种 AI 生成背景场景
- ✅ 批量处理
- ✅ 多平台尺寸预设

### 商业模式
- **Free**: 10积分/月
- **Pro**: $9.99/月，无限使用 + AI背景

### 增长策略
- **推荐系统**: 双方各得5积分
- **联盟营销**: 30%循环佣金
- **邮件营销**: 自动化邮件序列

---

## 📁 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | Next.js 15, React 18, TypeScript |
| 样式 | Tailwind CSS, Inline Styles |
| 后端 | Next.js API Routes |
| 数据库 | PostgreSQL (Neon) + Prisma ORM |
| 认证 | NextAuth.js |
| 支付 | Stripe |
| 邮件 | Resend |
| AI | Fal.ai (可选) |
| 部署 | Vercel |

---

## 🛠️ 快速开始

### 1. 克隆项目
```bash
git clone <your-repo>
cd image-bg-remover
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 填入你的 API keys
```

### 4. 初始化数据库
```bash
npx prisma migrate dev
```

### 5. 运行开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

---

## 📋 环境变量清单

### 必需
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
REMOVE_BG_API_KEY=your-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
```

### 推荐
```env
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
```

### 可选
```env
FAL_API_KEY=...  # AI背景生成
```

---

## 🚀 部署指南

### Vercel 部署

1. **连接 GitHub 仓库**
   - 登录 Vercel
   - Import 项目
   - 选择 GitHub 仓库

2. **配置环境变量**
   - 在 Vercel Dashboard → Settings → Environment Variables
   - 添加所有必需变量

3. **配置数据库**
   - 创建 Neon 数据库
   - 运行 `npx prisma migrate deploy`

4. **配置 Stripe**
   - 创建产品/价格
   - 配置 Webhook URL: `https://yourdomain.com/api/stripe/webhook`

5. **部署**
   - 点击 Deploy
   - 或使用 CLI: `vercel --prod`

详细步骤见 [DEPLOY.md](./DEPLOY.md)

---

## 📊 项目结构

```
image-bg-remover/
├── prisma/
│   └── schema.prisma       # 数据库模型
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API 路由
│   │   ├── login/          # 登录页
│   │   ├── pricing/        # 定价页
│   │   ├── dashboard/      # 用户仪表板
│   │   ├── referral/       # 推荐页面
│   │   ├── affiliates/     # 联盟页面
│   │   └── page.tsx        # 首页
│   ├── lib/                # 工具函数
│   │   ├── prisma.ts
│   │   ├── stripe.ts
│   │   ├── email.ts
│   │   ├── referral.ts
│   │   └── affiliate.ts
│   └── types/              # TypeScript 类型
├── public/                 # 静态资源
├── scripts/                # 脚本
├── .env.example            # 环境变量模板
├── DEPLOY.md               # 部署文档
└── README.md               # 项目文档
```

---

## 💰 盈利模式

### 1. 订阅收入
- Pro 订阅: $9.99/月
- 年度订阅可享折扣

### 2. 推荐奖励
- 每成功推荐: 5积分
- 降低获客成本

### 3. 联盟营销
- 30% 循环佣金
- 扩大市场覆盖

---

## 📈 增长策略

### 已实施
- ✅ 病毒式推荐系统
- ✅ 联盟营销计划
- ✅ 邮件营销自动化
- ✅ SEO 优化

### 待实施
- [ ] Google Ads
- [ ] 内容营销
- [ ] 社交媒体运营
- [ ] Product Hunt 发布

---

## 🔧 维护任务

### 日常
- 监控 Stripe webhook 状态
- 检查邮件发送率
- 查看用户反馈

### 每周
- 分析转化漏斗
- 检查服务器日志
- 审核联盟申请

### 每月
- 数据库备份
- 安全更新
- 性能优化

---

## 🐛 故障排除

### 数据库连接失败
- 检查 DATABASE_URL 格式
- 确认 Neon 允许 Vercel IP
- 运行 `npx prisma db pull` 测试

### Stripe Webhook 失败
- 检查 webhook URL
- 验证 webhook secret
- 查看 Vercel 日志

### 邮件发送失败
- 验证 Resend API key
- 检查 FROM_EMAIL 域名验证
- 查看 Resend 仪表板

---

## 📞 支持

- **文档**: [DEPLOY.md](./DEPLOY.md)
- **健康检查**: `/api/health`
- **问题反馈**: GitHub Issues

---

## 📄 许可证

MIT License

---

## 🎉 项目完成度

- [x] 核心功能 (100%)
- [x] 支付系统 (100%)
- [x] 用户系统 (100%)
- [x] 推荐系统 (100%)
- [x] 联盟系统 (100%)
- [x] 邮件系统 (100%)
- [x] 部署配置 (100%)

**状态**: ✅ 生产就绪

---

Made with ❤️ for the global market
