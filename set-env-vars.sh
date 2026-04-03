#!/bin/bash
# 设置 Cloudflare Pages 环境变量

echo "设置 Cloudflare Pages 环境变量..."

export CLOUDFLARE_API_TOKEN="cfut_T55yCElPTIRDkhKxQH4InemCWO6oEDZ6Xdy51SfS8fe94f01"

cd /c/root/.openclaw/workspace-dev/image-bg-remover

echo ""
echo "设置必需的环境变量..."
echo ""

# 设置环境变量（生产环境）
npx wrangler pages secret put NEXTAUTH_SECRET --project-name=bg-remover-pro << 'EOF'
build-secret-key-change-in-production
EOF

echo "NEXTAUTH_SECRET 设置完成"

echo ""
echo "⚠️  注意：其他敏感环境变量需要手动设置："
echo ""
echo "请运行以下命令逐一设置："
echo ""
echo "npx wrangler pages secret put DATABASE_URL --project-name=bg-remover-pro"
echo "npx wrangler pages secret put REMOVE_BG_API_KEY --project-name=bg-remover-pro"
echo "npx wrangler pages secret put STRIPE_SECRET_KEY --project-name=bg-remover-pro"
echo "npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name=bg-remover-pro"
echo "npx wrangler pages secret put STRIPE_PRICE_ID_PRO --project-name=bg-remover-pro"
echo "npx wrangler pages secret put RESEND_API_KEY --project-name=bg-remover-pro"
echo "npx wrangler pages secret put FROM_EMAIL --project-name=bg-remover-pro"
echo ""
echo "或者使用 Cloudflare Dashboard:"
echo "https://dash.cloudflare.com → Pages → bg-remover-pro → Settings → Environment variables"
echo ""

read -p "按回车键继续..."
