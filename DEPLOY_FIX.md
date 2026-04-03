# Cloudflare Pages 部署修复指南

## 问题总结

在 Windows 上部署 Cloudflare Pages 遇到以下问题：

1. **@cloudflare/next-on-pages 在 Windows 上不稳定** - 需要 bash 环境
2. **wrangler 未登录** - 需要运行 `wrangler login`

## 解决方案

### 方案 1: 使用 Git Bash 手动部署（推荐）

1. **打开 Git Bash** (在开始菜单中找到 "Git Bash")

2. **导航到项目目录**:
   ```bash
   cd /c/root/.openclaw/workspace-dev/image-bg-remover
   ```

3. **登录 Cloudflare**:
   ```bash
   npx wrangler login
   ```
   - 这会打开浏览器让你授权
   - 授权完成后回到终端

4. **运行构建**（可选，如果 .vercel/output/static 已存在则跳过）:
   ```bash
   npm install
   npx prisma generate
   npm run pages:build
   ```

5. **直接部署**（使用已有的构建输出）:
   ```bash
   npx wrangler pages deploy .vercel/output/static --project-name=bg-remover-pro
   ```

### 方案 2: 使用 WSL2 (Windows Subsystem for Linux)

如果安装了 WSL2:

```bash
# 在 WSL2 中
cd /mnt/c/root/.openclaw/workspace-dev/image-bg-remover
npm install
npx wrangler login
npm run pages:build
npx wrangler pages deploy .vercel/output/static
```

### 方案 3: 使用 GitHub Actions 自动部署

创建 `.github/workflows/deploy-cloudflare.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: |
          npm install
          npx prisma generate
          
      - name: Build
        run: npm run pages:build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: bg-remover-pro
          directory: .vercel/output/static
```

然后在 GitHub 仓库设置中添加 Secrets:
- `CLOUDFLARE_API_TOKEN`: 从 Cloudflare Dashboard 创建
- `CLOUDFLARE_ACCOUNT_ID`: 你的 Cloudflare 账户 ID

## 当前状态

✅ **构建已完成** - `.vercel/output/static` 目录已存在
⬜ **需要登录** - 运行 `npx wrangler login`
⬜ **需要部署** - 登录后运行部署命令

## 快速部署命令（复制粘贴）

在 Git Bash 中执行:

```bash
cd /c/root/.openclaw/workspace-dev/image-bg-remover
npx wrangler login
npx wrangler pages deploy .vercel/output/static --project-name=bg-remover-pro
```

## 环境变量设置

部署后需要设置的环境变量（在 Cloudflare Dashboard 或命令行）:

```bash
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put DATABASE_URL
npx wrangler secret put REMOVE_BG_API_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_PRICE_ID_PRO
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put FROM_EMAIL
```

## 验证部署

部署完成后访问:
- https://bg-remover-pro.pages.dev

检查 Functions 日志:
```bash
npx wrangler pages deployment tail --project-name=bg-remover-pro
```
