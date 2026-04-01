import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { 
  getOrCreateReferralCode, 
  getReferralStats,
  createReferral 
} from '@/lib/referral'

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
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const [referralCode, stats] = await Promise.all([
      getOrCreateReferralCode(user.id),
      getReferralStats(user.id),
    ])

    const referralUrl = `${process.env.NEXTAUTH_URL}/?ref=${referralCode}`

    return NextResponse.json({
      referralCode,
      referralUrl,
      stats,
    })
  } catch (error: any) {
    console.error('Referral GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
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
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { email } = await req.json()
    
    const referral = await createReferral(user.id, email)
    const referralUrl = `${process.env.NEXTAUTH_URL}/?ref=${referral.code}`

    return NextResponse.json({
      success: true,
      referralCode: referral.code,
      referralUrl,
    })
  } catch (error: any) {
    console.error('Referral POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}
