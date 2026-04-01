'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface ReferralStats {
  total: number
  signedUp: number
  converted: number
  totalCredits: number
  referrals: Array<{
    id: string
    email: string | null
    status: string
    creditsAwarded: number
    createdAt: string
  }>
}

export default function ReferralPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [referralData, setReferralData] = useState<{
    referralCode: string
    referralUrl: string
    stats: ReferralStats
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchReferralData()
    }
  }, [status, router])

  const fetchReferralData = async () => {
    try {
      const res = await fetch('/api/referral')
      if (res.ok) {
        const data = await res.json()
        setReferralData(data)
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '🐦',
      url: (referralUrl: string) => `https://twitter.com/intent/tweet?text=Check out this awesome AI background remover!&url=${encodeURIComponent(referralUrl)}`,
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: (referralUrl: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: (referralUrl: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
    },
    {
      name: 'Email',
      icon: '📧',
      url: (referralUrl: string) => `mailto:?subject=Check out BG Remover Pro&body=I found this great tool for removing image backgrounds: ${referralUrl}`,
    },
  ]

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

  if (!referralData) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Failed to load data</div>
      </div>
    )
  }

  const { referralCode, referralUrl, stats } = referralData

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', padding: '32px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '9999px', color: '#fbbf24', fontSize: '14px', marginBottom: '24px' }}>
            <span style={{ fontSize: '16px' }}>🎁</span>
            Earn Free Credits
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
            Refer & Earn
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)', maxWidth: '500px', margin: '0 auto' }}>
            Invite your friends and earn <strong style={{ color: '#fbbf24' }}>5 free credits</strong> for each friend who signs up!
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Invited', value: stats.total, icon: '👥' },
            { label: 'Signed Up', value: stats.signedUp, icon: '✅' },
            { label: 'Credits Earned', value: stats.totalCredits, icon: '🪙' },
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Referral Link */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '32px',
            marginBottom: '32px',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px', textAlign: 'center' }}>
            Your Referral Link
          </h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input
              type="text"
              value={referralUrl}
              readOnly
              style={{
                flex: 1,
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => copyToClipboard(referralUrl)}
              style={{
                padding: '16px 24px',
                background: copied 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* Share Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {shareOptions.map((option) => (
              <a
                key={option.name}
                href={option.url(referralUrl)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                <span>{option.icon}</span>
                {option.name}
              </a>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px', textAlign: 'center' }}>
            How It Works
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { step: '1', title: 'Share Your Link', desc: 'Copy your unique referral link and share it with friends' },
              { step: '2', title: 'Friends Sign Up', desc: 'They create an account using your referral link' },
              { step: '3', title: 'Earn Credits', desc: 'You both get 5 free credits when they verify their email' },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Referrals */}
        {stats.referrals.length > 0 && (
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
              Recent Referrals
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.referrals.slice(0, 5).map((referral) => (
                    <tr key={referral.id}>
                      <td style={{ padding: '12px', color: '#ffffff', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        {referral.email || 'Anonymous'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: 
                              referral.status === 'converted' ? 'rgba(16, 185, 129, 0.2)' : 
                              referral.status === 'signed_up' ? 'rgba(59, 130, 246, 0.2)' : 
                              'rgba(255, 255, 255, 0.1)',
                            color: 
                              referral.status === 'converted' ? '#10b981' : 
                              referral.status === 'signed_up' ? '#3b82f6' : 
                              'rgba(255, 255, 255, 0.6)',
                          }}
                        >
                          {referral.status === 'converted' ? 'Converted' : 
                           referral.status === 'signed_up' ? 'Signed Up' : 
                           'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#fbbf24', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        +{referral.creditsAwarded}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
