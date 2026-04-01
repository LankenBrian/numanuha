'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'For casual users',
    price: 0,
    period: '',
    features: [
      '10 images/month',
      'Basic background removal',
      'Standard quality',
      'Email support',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals',
    price: 9.99,
    period: '/month',
    features: [
      'Unlimited images',
      'AI background generation',
      'HD quality export',
      'Batch processing',
      'Priority support',
      'No watermark',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
]

export default function PricingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    if (planId === 'free') {
      router.push('/')
      return
    }

    setIsLoading(planId)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch (error) {
      alert('Failed to start checkout')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', padding: '64px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '600px', margin: '0 auto' }}>
            Choose the plan that works best for you. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                backgroundColor: plan.popular ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: `2px solid ${plan.popular ? 'rgba(245, 158, 11, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                padding: '40px',
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                    color: '#ffffff',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Most Popular
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
                  {plan.name}
                </h2>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '16px' }}>
                  {plan.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffffff' }}>
                    ${plan.price}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '14px',
                      borderBottom: index < plan.features.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        fill={plan.popular ? '#f59e0b' : '#22d3ee'}
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading === plan.id}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: plan.popular
                    ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                    : 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading === plan.id ? 'not-allowed' : 'pointer',
                  boxShadow: plan.popular
                    ? '0 4px 20px rgba(245, 158, 11, 0.3)'
                    : '0 4px 20px rgba(34, 211, 238, 0.3)',
                  opacity: isLoading === plan.id ? 0.7 : 1,
                }}
              >
                {isLoading === plan.id ? 'Loading...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '800px', margin: '80px auto 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '32px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: '24px', textAlign: 'left' }}>
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards through Stripe, including Visa, Mastercard, American Express, and more.',
              },
              {
                q: 'Is there a refund policy?',
                a: 'Yes, we offer a 7-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                  {faq.q}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
