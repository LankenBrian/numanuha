'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

// 内部组件使用 useSearchParams
function LoginContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const refCode = searchParams.get('ref')

  // Store referral code in localStorage
  useEffect(() => {
    if (refCode) {
      localStorage.setItem('referralCode', refCode)
    }
  }, [refCode])

  // Get stored referral code
  const getStoredReferralCode = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('referralCode')
    }
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === 'Please verify your email before logging in' 
          ? '请先验证您的邮箱' 
          : '登录失败，请检查邮箱和密码')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('登录出错，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const referralCode = getStoredReferralCode()
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, referralCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '注册失败')
      } else {
        setMessage('注册成功！请检查您的邮箱完成验证。')
        setEmail('')
        setPassword('')
        setName('')
      }
    } catch (err) {
      setError('注册出错，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', margin: '0 auto 16px', background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
            {isLogin ? '欢迎回来' : '创建账号'}
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {isLogin ? '登录以继续使用 BG Remover Pro' : '注册开始使用 BG Remover Pro'}
          </p>
        </div>

        {verified && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#6ee7b7', fontSize: '14px' }}>
            ✅ 邮箱验证成功！请登录。
          </div>
        )}

        {message && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#6ee7b7', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>用户名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                placeholder="您的名字"
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              placeholder="your@email.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
              placeholder="••••••••"
            />
            {!isLogin && (
              <p style={{ marginTop: '6px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
                密码至少8位字符
              </p>
            )}
          </div>

          {error && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              background: isLoading ? 'rgba(34, 211, 238, 0.5)' : 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(34, 211, 238, 0.3)',
            }}
          >
            {isLoading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
            {isLogin ? '还没有账号？' : '已有账号？'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setMessage('')
              }}
              style={{ color: '#22d3ee', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>
        </div>

        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', textAlign: 'center' }}>
            Free: 10 credits/month<br/>
            Pro: Unlimited + AI Backgrounds
          </p>
        </div>

        {/* Referral Banner */}
        {refCode && (
          <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#fbbf24', fontSize: '14px', margin: 0 }}>
              🎁 You were invited! Sign up to get <strong>5 bonus credits</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// 主页面组件使用 Suspense 包裹
export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'white' }}>Loading...</div>
    </div>}>
      <LoginContent />
    </Suspense>
  )
}
