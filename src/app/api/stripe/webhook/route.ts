import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { trackAffiliateConversion } from '@/lib/affiliate'

// Edge Runtime 配置
export const runtime = 'edge'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId
        const affiliateCode = session.metadata?.affiliateCode
        
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'pro',
              credits: -1, // Unlimited for pro
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: session.line_items?.data[0]?.price?.id,
            },
          })

          // Track affiliate conversion
          if (affiliateCode && session.amount_total) {
            try {
              await trackAffiliateConversion(
                affiliateCode,
                userId,
                session.subscription as string,
                session.amount_total / 100 // Convert from cents
              )
            } catch (err) {
              console.error('Affiliate tracking error:', err)
            }
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const subscriptionId = (invoice as any).subscription as string
        
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const userId = (subscription as any).metadata?.userId
        
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            },
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const userId = subscription.metadata.userId
        
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              plan: 'free',
              credits: 10,
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
