#!/usr/bin/env node

// Environment Variable Validation Script
// Run before deployment: node scripts/validate-env.js

const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
  'REMOVE_BG_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_PRO',
]

const optionalEnvVars = [
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'FAL_API_KEY',
  'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO',
]

console.log('🔍 Validating environment variables...\n')

let hasErrors = false

// Check required variables
console.log('Required Variables:')
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`  ✅ ${envVar}`)
  } else {
    console.log(`  ❌ ${envVar} - MISSING`)
    hasErrors = true
  }
}

// Check optional variables
console.log('\nOptional Variables:')
for (const envVar of optionalEnvVars) {
  if (process.env[envVar]) {
    console.log(`  ✅ ${envVar}`)
  } else {
    console.log(`  ⚠️  ${envVar} - Not set (optional)`)
  }
}

// Validate specific formats
console.log('\nValidation Checks:')

// Check NEXTAUTH_URL format
if (process.env.NEXTAUTH_URL) {
  try {
    new URL(process.env.NEXTAUTH_URL)
    console.log('  ✅ NEXTAUTH_URL format valid')
  } catch {
    console.log('  ❌ NEXTAUTH_URL format invalid')
    hasErrors = true
  }
}

// Check DATABASE_URL format
if (process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log('  ✅ DATABASE_URL format valid')
  } else {
    console.log('  ❌ DATABASE_URL should start with postgresql://')
    hasErrors = true
  }
}

// Check Stripe keys format
if (process.env.STRIPE_SECRET_KEY) {
  if (process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    console.log('  ✅ STRIPE_SECRET_KEY format valid')
  } else {
    console.log('  ❌ STRIPE_SECRET_KEY should start with sk_')
    hasErrors = true
  }
}

console.log('\n' + '='.repeat(50))
if (hasErrors) {
  console.log('❌ Validation FAILED. Please fix the errors above.')
  process.exit(1)
} else {
  console.log('✅ All required environment variables are set!')
  console.log('🚀 Ready for deployment!')
  process.exit(0)
}
