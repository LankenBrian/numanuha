import Stripe from 'stripe'

// 延迟初始化 Stripe，避免构建时出错
let stripeInstance: Stripe | null = null

export function getStripe() {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia' as any,
    })
  }
  return stripeInstance
}

// 兼容旧代码
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    const stripe = getStripe()
    return (stripe as any)[prop]
  }
})

export async function createStripeCustomer(email: string, name?: string) {
  const stripe = getStripe()
  return stripe.customers.create({
    email,
    name: name || email.split('@')[0],
  })
}

export async function createCheckoutSession(
  customerId: string, 
  priceId: string, 
  userId: string,
  metadata?: Record<string, string>
) {
  const stripe = getStripe()
  return stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: {
      userId,
      ...metadata,
    },
    subscription_data: {
      metadata: {
        userId,
        ...metadata,
      },
    },
  })
}

export async function createBillingPortalSession(customerId: string) {
  const stripe = getStripe()
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  })
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe()
  return stripe.subscriptions.cancel(subscriptionId)
}
