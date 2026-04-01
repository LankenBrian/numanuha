import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { 
  createAffiliateApplication,
  getAffiliateByUserId,
  getAffiliateStats,
} from '@/lib/affiliate'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const affiliate = await getAffiliateByUserId(user.id)

    if (!affiliate) {
      return NextResponse.json({ 
        isAffiliate: false,
        applicationUrl: '/affiliates/apply',
      })
    }

    const stats = await getAffiliateStats(affiliate.id)
    const affiliateUrl = `${process.env.NEXTAUTH_URL}/?aff=${affiliate.code}`

    return NextResponse.json({
      isAffiliate: true,
      status: affiliate.status,
      affiliateUrl,
      stats,
    })
  } catch (error: any) {
    console.error('Affiliate GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch affiliate data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already an affiliate
    const existing = await getAffiliateByUserId(user.id)
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an affiliate account' },
        { status: 409 }
      )
    }

    const { website, paypalEmail, notes } = await req.json()

    if (!paypalEmail) {
      return NextResponse.json(
        { error: 'PayPal email is required' },
        { status: 400 }
      )
    }

    const affiliate = await createAffiliateApplication(user.id, {
      website,
      paypalEmail,
      notes,
    })

    return NextResponse.json({
      success: true,
      message: 'Application submitted for review',
      affiliate: {
        id: affiliate.id,
        code: affiliate.code,
        status: affiliate.status,
      },
    })
  } catch (error: any) {
    console.error('Affiliate POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create affiliate application' },
      { status: 500 }
    )
  }
}
