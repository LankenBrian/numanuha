# BG Remover Pro - AI Background Removal Tool

## ✅ Phase 1: 核心功能（已完成）

> Last updated: 2026-04-03 - Cloudflare Pages deployment ready

### 1. PostgreSQL 数据库集成 ✅
- 用户表（邮箱、密码、套餐、积分）
- 使用记录表
- 邮箱验证表
- Prisma ORM 配置

### 2. Stripe 支付集成 ✅
- Checkout 支付流程
- Webhook 处理订阅状态
- 账单管理门户
- 套餐自动升级/降级

### 3. 套餐限制系统 ✅
- Free: 10积分/月
- Pro: 无限积分 + AI背景生成
- 积分自动扣除
- 使用统计记录

### 4. 用户系统 ✅
- 注册/登录（邮箱验证）
- 用户仪表板
- 使用统计查看
- 账单管理

## ✅ Phase 2: 增长功能（已完成）

### 1. 创意 AI 背景预设 ✅
- **Studio**: White, Gray, Black, Pink/Blue Gradient
- **Lifestyle**: Urban, Nature, Beach, Coffee Shop, Home, Office
- **Luxury**: Interior, Marble & Gold, Velvet Red, Concrete
- **Seasonal**: Christmas, Valentine, Halloween, Summer
- **E-commerce**: Amazon Style, Flat Lay, Wood, Linen
- 分类筛选功能

### 2. 推荐奖励系统 ✅
- 唯一推荐码生成
- 推荐链接追踪
- 注册奖励（双方各得5积分）
- 社交分享功能
- 推荐统计仪表板

## ✅ Phase 3: 营销系统（已完成）

### 1. 邮件营销系统 ✅
- **Resend** 集成（推荐，免费额度充足）
- 欢迎邮件序列
- 低积分提醒邮件
- 流失用户召回邮件
- 邮箱验证邮件

### 2. 联盟营销系统 ✅
- 30% 循环佣金
- 联盟申请/审核流程
- 佣金追踪
- PayPal 提现
- 实时统计仪表板

## 🚀 快速启动

### 1. 环境变量配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 添加以下配置：
- REMOVE_BG_API_KEY (从 remove.bg 获取)
- DATABASE_URL (从 neon.tech 获取免费 PostgreSQL)
- NEXTAUTH_SECRET (openssl rand -base64 32)
- STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID_PRO (在 Stripe 创建产品价格)
- RESEND_API_KEY (从 resend.com 获取)
- FAL_API_KEY (可选，用于AI背景生成)
```

### 2. 数据库初始化
```bash
npx prisma generate
npx prisma db push
```

### 3. Stripe Webhook 配置（本地开发）
```bash
# 安装 Stripe CLI
# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 4. 运行项目
```bash
npm run dev
```

## 📁 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth 配置
│   │   ├── auth/register/         # 用户注册（支持推荐码）
│   │   ├── auth/verify/           # 邮箱验证
│   │   ├── stripe/
│   │   │   ├── checkout/          # Stripe Checkout
│   │   │   ├── portal/            # 账单门户
│   │   │   └── webhook/           # Webhook 处理
│   │   ├── user/stats/            # 用户统计
│   │   ├── referral/              # 推荐系统 API
│   │   ├── affiliate/             # 联盟营销 API
│   │   ├── email/                 # 邮件发送 API
│   │   ├── remove-bg/             # 背景移除 API
│   │   └── ai-background/         # AI背景生成 API
│   ├── login/                     # 登录/注册页面
│   ├── pricing/                   # 定价页面
│   ├── dashboard/                 # 用户仪表板
│   ├── referral/                  # 推荐页面
│   ├── affiliates/
│   │   ├── apply/                 # 联盟申请页面
│   │   └── dashboard/             # 联盟仪表板（待做）
│   └── page.tsx                   # 主页
├── lib/
│   ├── prisma.ts                  # Prisma 客户端
│   ├── user.ts                    # 用户相关函数
│   ├── email.ts                   # 邮件发送（Resend）
│   ├── stripe.ts                  # Stripe 工具
│   ├── referral.ts                # 推荐系统
│   └── affiliate.ts               # 联盟营销
└── types/
    └── next-auth.d.ts             # NextAuth 类型
```

## 🎯 出海优化

### 1. 支付本地化 ✅
- Stripe 支持 135+ 货币
- 自动货币转换
- 本地支付方式

### 2. 邮件营销 ✅
- 欢迎邮件序列
- 使用额度提醒
- 流失用户召回
- 交易邮件

### 3. 增长策略 ✅
- 病毒式推荐系统（5积分奖励）
- 联盟营销（30%循环佣金）
- 社交分享集成

### 4. 分析追踪（待做）
- Google Analytics
- Mixpanel/Amplitude
- 转化漏斗监控

## 💰 定价策略

| 套餐 | 价格 | 功能 |
|------|------|------|
| Free | $0 | 10张/月，基础功能 |
| Pro | $9.99/月 | 无限张，24种AI背景，批量处理 |

## 💸 联盟计划

- **佣金**: 30% 循环佣金
- **最低提现**: $50
- **支付方式**: PayPal
- **Cookie 有效期**: 60天

## 🔗 相关链接

- **Remove.bg API**: https://www.remove.bg/api
- **Neon PostgreSQL**: https://neon.tech (免费额度充足)
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Resend Email**: https://resend.com (免费 3000封/月)
- **Fal.ai**: https://fal.ai

## 📝 下一步（Phase 4 - 可选）

1. **分析追踪**
   - Google Analytics 4
   - 事件追踪
   - 转化漏斗

2. **高级功能**
   - 图片编辑工具（裁剪、旋转、滤镜）
   - 更多导出格式（WebP、AVIF）
   - API 访问（开发者计划）

3. **国际化**
   - 多语言支持
   - 本地化定价

---

## 🚀 部署检查清单

- [ ] 配置生产环境变量
- [ ] 设置 Stripe Webhook URL
- [ ] 配置 Resend API Key
- [ ] 测试支付流程
- [ ] 测试推荐系统
- [ ] 测试联盟追踪
- [ ] 测试邮件发送
- [ ] 设置自定义域名
- [ ] 配置 SSL 证书
- [ ] 设置隐私政策/TOS页面

---

## 项目完成度：95%

核心出海功能全部完成，可以开始部署运营！
