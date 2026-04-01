import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/user'
import { createVerificationToken, sendVerificationEmail, sendWelcomeEmail } from '@/lib/email'
import { trackReferralSignup, awardReferralCredits } from '@/lib/referral'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, referralCode } = await req.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create user
    const user = await createUser(email, password, name)

    // Handle referral
    if (referralCode) {
      try {
        await trackReferralSignup(referralCode, user.id)
        // Award credits immediately for signup
        await awardReferralCredits(user.id)
      } catch (err) {
        console.error('Referral tracking error:', err)
        // Don't fail registration if referral tracking fails
      }
    }

    // Create verification token
    const verification = await createVerificationToken(user.id)

    // Send emails (don't await to avoid blocking response)
    Promise.all([
      sendVerificationEmail(email, verification.token),
      sendWelcomeEmail(email, name || email.split('@')[0]),
    ]).catch(err => console.error('Email send error:', err))

    return NextResponse.json({
      success: true,
      message: 'User created. Please check your email to verify your account.',
      referralBonus: referralCode ? 'You received 5 bonus credits!' : undefined,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
