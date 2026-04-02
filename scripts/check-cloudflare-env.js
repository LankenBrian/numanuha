/**
 * Cloudflare Pages 环境变量检查脚本
 * 运行: node scripts/check-cloudflare-env.js
 */

const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
  'REMOVE_BG_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_PRO',
  'RESEND_API_KEY',
  'FROM_EMAIL',
]

const optionalEnvVars = [
  'FAL_API_KEY',
]

console.log('=====================================')
console.log('BG Remover Pro - 环境变量检查')
console.log('=====================================')
console.log()

let hasErrors = false

// 检查必需变量
console.log('必需环境变量:')
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  if (value) {
    const masked = value.length > 10 
      ? value.substring(0, 5) + '...' + value.substring(value.length - 5)
      : '***'
    console.log(`  ✓ ${envVar}: ${masked}`)
  } else {
    console.log(`  ✗ ${envVar}: 未设置`)
    hasErrors = true
  }
}

console.log()

// 检查可选变量
console.log('可选环境变量:')
for (const envVar of optionalEnvVars) {
  const value = process.env[envVar]
  if (value) {
    console.log(`  ✓ ${envVar}: 已设置`)
  } else {
    console.log(`  - ${envVar}: 未设置 (可选)`)
  }
}

console.log()

// 检查 DATABASE_URL 格式
const dbUrl = process.env.DATABASE_URL
if (dbUrl) {
  console.log('数据库连接检查:')
  if (dbUrl.includes('neon.tech')) {
    console.log('  ✓ 检测到 Neon PostgreSQL')
  } else if (dbUrl.includes('postgres')) {
    console.log('  ! 使用 PostgreSQL (非 Neon)')
  } else {
    console.log('  ✗ 数据库 URL 格式可能不正确')
    hasErrors = true
  }
}

console.log()

// 检查 Stripe 配置
const stripeKey = process.env.STRIPE_SECRET_KEY
if (stripeKey) {
  console.log('Stripe 配置检查:')
  if (stripeKey.startsWith('sk_test_')) {
    console.log('  ! 使用 Stripe 测试模式')
  } else if (stripeKey.startsWith('sk_live_')) {
    console.log('  ✓ 使用 Stripe 生产模式')
  } else {
    console.log('  ✗ Stripe Key 格式不正确')
    hasErrors = true
  }
}

console.log()
console.log('=====================================')

if (hasErrors) {
  console.log('✗ 检查失败: 有必需的环境变量未设置')
  console.log()
  console.log('请通过以下命令设置环境变量:')
  console.log('  wrangler secret put <变量名>')
  console.log()
  console.log('或在本地开发时创建 .env.local 文件')
  process.exit(1)
} else {
  console.log('✓ 所有必需环境变量已设置')
  console.log('项目可以部署到 Cloudflare Pages!')
  process.exit(0)
}
