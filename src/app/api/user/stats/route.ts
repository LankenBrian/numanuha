import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUsageStats } from '@/lib/user'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get usage stats for last 30 days
    const stats = await getUsageStats(user.id, 30)

    return NextResponse.json({
      user: {
        ...user,
        isPro: user.plan === 'pro' && 
          (!user.stripeCurrentPeriodEnd || user.stripeCurrentPeriodEnd > new Date()),
      },
      stats,
    })
  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
