'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

interface UsageStats {
  totalUsage: number
  successfulUsage: number
  failedUsage: number
  logs: Array<{
    id: string
    action: string
    status: string
    createdAt: string
  }>
}

interface UserData {
  user: {
    id: string
    email: string
    name: string | null
    plan: string
    credits: number
    usageCount: number
    isPro: boolean
    createdAt: string
  }
  stats: UsageStats
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(!!success)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchUserData()
    }
  }, [status, router])

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/stats')
      const data = await res.json()
      
      if (res.ok) {
        setUserData(data)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      alert('Failed to open billing portal')
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#ffffff', fontSize: '18px' }}>Failed to load data</div>
      </div>
    )
  }

  const { user, stats } = userData

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', padding: '32px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
              Dashboard
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Back to App
            </button>
            <button
              onClick={() => signOut()}
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div
            style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              color: '#6ee7b7',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <strong>Payment Successful!</strong>
              <p style={{ margin: 0, fontSize: '14px' }}>Your Pro subscription is now active. Enjoy unlimited access!</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <a
            href="/referral"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🎁</span>
            Refer & Earn Credits
          </a>
          {!user.isPro && (
            <a
              href="/pricing"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              Upgrade to Pro
            </a>
          )}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Plan Card */}
          <div
            style={{
              backgroundColor: user.isPro ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: `1px solid ${user.isPro ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: user.isPro
                    ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
                    : 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>Current Plan</p>
                <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                  {user.isPro ? 'Pro' : 'Free'}
                </p>
              </div>
            </div>
            {user.isPro ? (
              <button
                onClick={handleManageBilling}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Manage Billing
              </button>
            ) : (
              <button
                onClick={() => router.push('/pricing')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Upgrade to Pro
              </button>
            )}
          </div>

          {/* Credits Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                </svg>
              </div>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>Credits Remaining</p>
                <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                  {user.credits === -1 ? 'Unlimited' : user.credits}
                </p>
              </div>
            </div>
            {!user.isPro && (
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '10px' }}>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', margin: 0 }}>
                  Free plan: 10 credits/month
                </p>
              </div>
            )}
          </div>

          {/* Usage Card */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <div>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: 0 }}>Total Usage (30 days)</p>
                <p style={{ color: '#ffffff', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                  {stats.totalUsage} images
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <p style={{ color: '#10b981', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{stats.successfulUsage}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', margin: 0 }}>Success</p>
              </div>
              <div style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                <p style={{ color: '#ef4444', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{stats.failedUsage}</p>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', margin: 0 }}>Failed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
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
            Recent Activity
          </h2>
          {stats.logs.length === 0 ? (
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '32px' }}>
              No activity yet. Start processing images!
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Action</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.logs.slice(0, 10).map((log) => (
                    <tr key={log.id}>
                      <td style={{ padding: '12px', color: '#ffffff', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        {log.action === 'remove_bg' ? 'Background Removal' : log.action}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: log.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: log.status === 'success' ? '#10b981' : '#ef4444',
                          }}
                        >
                          {log.status === 'success' ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
