'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

// 内联样式定义
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #831843 100%)',
    color: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '64px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '24px',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '32px',
  },
  button: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(34, 211, 238, 0.3)',
  },
  uploadArea: {
    border: '2px dashed rgba(255,255,255,0.3)',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: '48px',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '64px',
  },
  featureCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  featureIcon: {
    fontSize: '32px',
    marginBottom: '16px',
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  featureDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
  },
}

export default function HomePage() {
  const { data: session } = useSession()
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>BG Remover Pro</div>
        <nav>
          {session ? (
            <button onClick={() => signOut()} style={{...styles.button, background: 'rgba(255,255,255,0.1)'}}>
              Sign Out
            </button>
          ) : (
            <a href="/login" style={styles.button}>Get Started</a>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Hero Section */}
        <section style={styles.hero}>
          <h1 style={styles.title}>
            Remove Image Backgrounds
            <br />
            with AI
          </h1>
          <p style={styles.subtitle}>
            Professional background removal for e-commerce, social media, and product photography.
            <br />
            Free tier available. No signup required.
          </p>
          <a href={session ? '/dashboard' : '/login'} style={styles.button}>
            {session ? 'Go to Dashboard' : 'Start Free Trial'}
          </a>
        </section>

        {/* Upload Area */}
        <section style={styles.uploadArea}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
          <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Drop your image here</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>or click to browse (JPG, PNG up to 10MB)</p>
        </section>

        {/* Features */}
        <section style={styles.features}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Lightning Fast</h3>
            <p style={styles.featureDesc}>Remove backgrounds in 5 seconds with AI-powered processing</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🎨</div>
            <h3 style={styles.featureTitle}>24 AI Backgrounds</h3>
            <p style={styles.featureDesc}>Choose from studio, lifestyle, luxury, and seasonal presets</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💎</div>
            <h3 style={styles.featureTitle}>HD Quality</h3>
            <p style={styles.featureDesc}>Get professional-grade results with edge-perfect removal</p>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section style={{ textAlign: 'center', padding: '48px 0' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>Simple Pricing</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{...styles.featureCard, maxWidth: '300px'}}>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Free</h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>$0</p>
              <ul style={{ textAlign: 'left', color: 'rgba(255,255,255,0.7)', lineHeight: 2 }}>
                <li>10 images/month</li>
                <li>Basic backgrounds</li>
                <li>Standard quality</li>
              </ul>
            </div>
            <div style={{...styles.featureCard, maxWidth: '300px', borderColor: '#22d3ee'}}>
              <h3 style={{ fontSize: '24px', marginBottom: '8px' }}>Pro</h3>
              <p style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>$9.99<span style={{ fontSize: '16px' }}>/mo</span></p>
              <ul style={{ textAlign: 'left', color: 'rgba(255,255,255,0.7)', lineHeight: 2 }}>
                <li>Unlimited images</li>
                <li>24 AI backgrounds</li>
                <li>HD quality</li>
                <li>Batch processing</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
        <p>© 2024 BG Remover Pro. All rights reserved.</p>
      </footer>
    </div>
  )
}
