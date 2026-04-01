# Database Integration Guide

## PostgreSQL 数据库集成已完成

### 已安装依赖
- `@neondatabase/serverless` - Neon PostgreSQL 无服务器驱动
- `pg` - PostgreSQL 客户端
- `prisma` - ORM
- `@prisma/client` - Prisma 客户端
- `bcryptjs` - 密码哈希
- `@next-auth/prisma-adapter` - NextAuth Prisma 适配器

### 数据库 Schema

#### 用户表 (User)
- `id` - 用户ID
- `email` - 邮箱（唯一）
- `emailVerified` - 邮箱验证时间
- `password` - 哈希密码
- `name` - 用户名
- `image` - 头像
- `plan` - 套餐 (free/pro)
- `credits` - 剩余积分 (-1 表示 Pro 无限)
- `usageCount` - 使用次数
- `stripeCustomerId` - Stripe 客户ID
- `stripeSubscriptionId` - Stripe 订阅ID
- `stripePriceId` - Stripe 价格ID
- `stripeCurrentPeriodEnd` - 订阅到期时间

#### 使用记录表 (UsageLog)
- 记录每次图片处理操作
- 包含操作类型、状态、积分消耗、元数据

#### 邮箱验证表 (EmailVerification)
- 存储邮箱验证令牌

### 环境变量配置

在 `.env.local` 中添加：

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_password
FROM_EMAIL=noreply@example.com
```

### 数据库初始化步骤

1. **设置数据库连接**
   ```bash
   # 推荐使用 Neon (https://neon.tech) 或 Supabase
   # 获取连接字符串后添加到 .env.local
   ```

2. **初始化 Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **查看数据库（可选）**
   ```bash
   npx prisma studio
   ```

### API 端点

#### 注册
- `POST /api/auth/register`
- Body: `{ email, password, name? }`

#### 邮箱验证
- `GET /api/auth/verify?token=xxx`
- 验证后重定向到登录页

#### 用户统计
- `GET /api/user/stats`
- 返回用户信息和30天使用统计

### 功能特性

1. **用户认证**
   - 邮箱/密码登录
   - 邮箱验证
   - 密码哈希存储

2. **套餐管理**
   - Free: 10积分/月
   - Pro: 无限积分

3. **使用统计**
   - 自动记录每次处理
   - 积分自动扣除
   - 使用历史查询

4. **安全特性**
   - 密码 bcrypt 哈希
   - JWT session
   - 邮箱验证令牌24小时过期

### 下一步

1. 配置 PostgreSQL 数据库连接
2. 运行 `npx prisma db push` 创建表
3. 配置 SMTP 发送验证邮件
4. 集成 Stripe 支付
