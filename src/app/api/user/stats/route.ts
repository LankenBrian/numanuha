import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { getUsageStats } from '@/lib/user'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        credits: true,
        usageCount: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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
