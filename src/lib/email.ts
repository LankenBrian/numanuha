import { Resend } from 'resend'
import { prisma } from './prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

// Create email verification token
export async function createVerificationToken(userId: string) {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  const verification = await prisma.emailVerification.create({
    data: {
      userId,
      token,
      expires,
    },
  })

  return verification
}

// Verify email token
export async function verifyEmailToken(token: string) {
  const verification = await prisma.emailVerification.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!verification) {
    return null
  }

  if (verification.expires < new Date()) {
    return null
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: verification.userId },
    data: { emailVerified: new Date() },
  })

  // Delete the verification token
  await prisma.emailVerification.delete({
    where: { id: verification.id },
  })

  return verification.user
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('Resend not configured, logging email instead:')
    console.log({ to, subject, html: html.substring(0, 200) + '...' })
    return { success: true, id: 'mock-email-id' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'BG Remover Pro <noreply@yourdomain.com>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// Welcome Email
export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1e1b4b; font-size: 28px; margin-bottom: 8px;">Welcome to BG Remover Pro! 🎉</h1>
        <p style="color: #6b7280; font-size: 16px;">Your AI-powered background removal tool</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%); border-radius: 16px; padding: 32px; color: white; margin-bottom: 32px;">
        <h2 style="margin-top: 0; font-size: 20px;">Hi ${name || 'there'},</h2>
        <p style="font-size: 16px; line-height: 1.6; opacity: 0.9;">
          Thanks for joining BG Remover Pro! You now have <strong>10 free credits</strong> to start removing backgrounds with AI.
        </p>
      </div>
      
      <div style="margin-bottom: 32px;">
        <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px;">Quick Start Guide:</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <span style="font-size: 24px;">1️⃣</span>
            <span style="color: #374151;">Upload your product photo</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <span style="font-size: 24px;">2️⃣</span>
            <span style="color: #374151;">AI removes background in 5 seconds</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; padding: 16px; background: #f9fafb; border-radius: 8px;">
            <span style="font-size: 24px;">3️⃣</span>
            <span style="color: #374151;">Download HD result</span>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Start Removing Backgrounds
        </a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
          Want more? Upgrade to Pro for unlimited access + 24 AI backgrounds!
        </p>
        <a href="${process.env.NEXTAUTH_URL}/pricing" style="color: #f59e0b; text-decoration: none; font-weight: 600;">
          Upgrade to Pro →
        </a>
      </div>
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px;">
          You're receiving this because you signed up for BG Remover Pro.<br>
          <a href="${process.env.NEXTAUTH_URL}/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `
  
  return sendEmail(email, 'Welcome to BG Remover Pro! 🎉', html)
}

// Low Credits Reminder
export async function sendLowCreditsEmail(email: string, name: string, credits: number) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1e1b4b; font-size: 28px; margin-bottom: 8px;">Running Low on Credits ⚠️</h1>
      </div>
      
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); border-radius: 16px; padding: 32px; color: white; margin-bottom: 32px; text-align: center;">
        <p style="font-size: 48px; margin: 0; font-weight: bold;">${credits}</p>
        <p style="font-size: 16px; margin: 8px 0 0 0; opacity: 0.9;">credits remaining</p>
      </div>
      
      <div style="margin-bottom: 32px; text-align: center;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Hi ${name || 'there'},<br><br>
          You're running low on credits. Don't let your workflow stop!
        </p>
      </div>
      
      <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: 32px; flex-wrap: wrap;">
        <a href="${process.env.NEXTAUTH_URL}/pricing" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Upgrade to Pro
        </a>
        <a href="${process.env.NEXTAUTH_URL}/referral" style="display: inline-block; background: #f3f4f6; color: #374151; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Earn Free Credits
        </a>
      </div>
      
      <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">Pro Benefits:</h3>
        <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Unlimited background removals</li>
          <li>24 AI-generated backgrounds</li>
          <li>Batch processing</li>
          <li>HD quality exports</li>
          <li>No watermark</li>
        </ul>
      </div>
    </div>
  `
  
  return sendEmail(email, `You have ${credits} credits left`, html)
}

// Re-engagement Email
export async function sendReEngagementEmail(email: string, name: string) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1e1b4b; font-size: 28px; margin-bottom: 8px;">We Miss You! 💙</h1>
        <p style="color: #6b7280; font-size: 16px;">Your credits are waiting</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%); border-radius: 16px; padding: 32px; color: white; margin-bottom: 32px; text-align: center;">
        <p style="font-size: 16px; line-height: 1.6; opacity: 0.9;">
          Hi ${name || 'there'},<br><br>
          It's been a while since you last used BG Remover Pro. We've been working on some exciting new features!
        </p>
      </div>
      
      <div style="margin-bottom: 32px;">
        <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; text-align: center;">What's New:</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #22d3ee;">
            <strong style="color: #1f2937;">🎨 24 AI Backgrounds</strong>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Studio, lifestyle, luxury, seasonal & more</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #a78bfa;">
            <strong style="color: #1f2937;">🎁 Referral Program</strong>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Earn 5 free credits for each friend you invite</p>
          </div>
          <div style="padding: 16px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <strong style="color: #1f2937;">⚡ Faster Processing</strong>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Now 2x faster background removal</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${process.env.NEXTAUTH_URL}" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Start Creating
        </a>
      </div>
      
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); border-radius: 12px; padding: 24px; text-align: center; color: white;">
        <p style="font-size: 16px; margin: 0 0 12px 0;">Limited Time Offer</p>
        <p style="font-size: 24px; font-weight: bold; margin: 0;">20% OFF Pro Plan</p>
        <p style="font-size: 14px; margin: 8px 0 0 0; opacity: 0.9;">Use code: COMEBACK20</p>
      </div>
    </div>
  `
  
  return sendEmail(email, 'We miss you! Here\'s what\'s new 💙', html)
}

// Verification Email
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1e1b4b; font-size: 28px; margin-bottom: 8px;">Verify Your Email ✉️</h1>
      </div>
      
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #581c87 100%); border-radius: 16px; padding: 32px; color: white; margin-bottom: 32px; text-align: center;">
        <p style="font-size: 16px; line-height: 1.6; opacity: 0.9;">
          Thanks for signing up! Please verify your email address to activate your account and claim your free credits.
        </p>
      </div>
      
      <div style="text-align: center; margin-bottom: 32px;">
        <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%); color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Verify Email Address
        </a>
      </div>
      
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Or copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #3b82f6; word-break: break-all;">${verificationUrl}</a>
        </p>
      </div>
      
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `
  
  return sendEmail(email, 'Verify your email address', html)
}
