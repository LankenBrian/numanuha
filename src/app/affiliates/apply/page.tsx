'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AffiliateApplyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [affiliateStatus, setAffiliateStatus] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    website: '',
    paypalEmail: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      checkAffiliateStatus()
    }
  }, [status, router])

  const checkAffiliateStatus = async () => {
    try {
      const res = await fetch('/api/affiliate')
      const data = await res.json()
      
      if (data.isAffiliate) {
        setAffiliateStatus(data.status)
        if (data.status === 'approved') {
          router.push('/affiliates/dashboard')
          return
        }
      }
    } catch (error) {
      console.error('Failed to check affiliate status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Application submitted! We will review it within 24-48 hours.')
        setAffiliateStatus('pending')
      } else {
        setError(data.error || 'Failed to submit application')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

  if (affiliateStatus === 'pending') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', padding: '64px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
            Application Pending
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '32px' }}>
            Thank you for applying! We're reviewing your application and will get back to you within 24-48 hours.
          </p>
          <a
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', padding: '64px 24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '9999px', color: '#fbbf24', fontSize: '14px', marginBottom: '24px' }}>
            <span style={{ fontSize: '16px' }}>💰</span>
            Earn 30% Commission
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
            Become an Affiliate
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)' }}>
            Promote BG Remover Pro and earn 30% recurring commission on every sale
          </p>
        </div>

        {/* Benefits */}
        <div style={{ display: 'grid', gap: '16px', marginBottom: '48px' }}>
          {[
            { icon: '💰', title: '30% Commission', desc: 'Earn 30% on every subscription, recurring monthly' },
            { icon: '🔄', title: 'Recurring Revenue', desc: 'Get paid every month your referrals stay subscribed' },
            { icon: '💸', title: '$50 Minimum Payout', desc: 'Get paid via PayPal when you reach $50' },
            { icon: '📊', title: 'Real-time Stats', desc: 'Track clicks, conversions, and earnings in real-time' },
          ].map((benefit, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div style={{ fontSize: '32px' }}>{benefit.icon}</div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                  {benefit.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Application Form */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '32px',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px', textAlign: 'center' }}>
            Apply Now
          </h2>

          {error && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#6ee7b7', fontSize: '14px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                PayPal Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                required
                value={formData.paypalEmail}
                onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="your@paypal.com"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Website / Social Media
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                }}
                placeholder="https://yourwebsite.com or @yourhandle"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                How will you promote us?
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '100px',
                }}
                placeholder="Tell us about your audience and promotion strategy..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '16px',
                background: isSubmitting 
                  ? 'rgba(245, 158, 11, 0.5)' 
                  : 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { q: 'How much can I earn?', a: 'You earn 30% of every subscription payment, recurring monthly. If a customer pays $9.99/month, you earn $3.00 every month they stay subscribed.' },
              { q: 'When do I get paid?', a: 'We pay via PayPal within the first week of each month, once you reach the $50 minimum threshold.' },
              { q: 'How long do cookies last?', a: 'Our affiliate cookies last for 60 days. If a user clicks your link and subscribes within 60 days, you get the commission.' },
              { q: 'Can I promote on any platform?', a: 'Yes! You can promote on your website, blog, YouTube, social media, email newsletters, or any other channel.' },
            ].map((faq, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
                  {faq.q}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
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
