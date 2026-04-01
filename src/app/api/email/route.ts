import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { 
  sendWelcomeEmail, 
  sendLowCreditsEmail, 
  sendReEngagementEmail 
} from '@/lib/email'

// Send welcome email manually (for testing)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type } = await req.json()
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let result
    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(user.email, user.name || '')
        break
      case 'low-credits':
        result = await sendLowCreditsEmail(user.email, user.name || '', user.credits)
        break
      case 're-engagement':
        result = await sendReEngagementEmail(user.email, user.name || '')
        break
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// Get email status/history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // This is a placeholder - in production you'd store email logs in the database
    return NextResponse.json({
      emails: [],
      preferences: {
        marketing: true,
        productUpdates: true,
        usageAlerts: true,
      },
    })
  } catch (error: any) {
    console.error('Get email status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email status' },
      { status: 500 }
    )
  }
}
