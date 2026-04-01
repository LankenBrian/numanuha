import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const checks = {
    database: false,
    stripe: false,
    email: false,
    removeBg: false,
    timestamp: new Date().toISOString(),
  }

  const errors: string[] = []

  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    errors.push('Database connection failed')
  }

  // Check Stripe
  if (process.env.STRIPE_SECRET_KEY) {
    checks.stripe = true
  } else {
    errors.push('Stripe not configured')
  }

  // Check Email
  if (process.env.RESEND_API_KEY || process.env.SMTP_HOST) {
    checks.email = true
  } else {
    errors.push('Email not configured')
  }

  // Check Remove.bg
  if (process.env.REMOVE_BG_API_KEY) {
    checks.removeBg = true
  } else {
    errors.push('Remove.bg API not configured')
  }

  const allHealthy = Object.values(checks).every(v => 
    typeof v === 'boolean' ? v : true
  )

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      errors: errors.length > 0 ? errors : undefined,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
    },
    { status: allHealthy ? 200 : 503 }
  )
}
