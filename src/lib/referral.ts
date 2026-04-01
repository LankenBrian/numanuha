import { prisma } from './prisma'

const REFERRAL_CREDITS = 5 // Credits awarded for successful referral

export async function getOrCreateReferralCode(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  })
  
  return user?.referralCode
}

export async function createReferral(referrerId: string, email?: string) {
  const code = generateReferralCode()
  
  return prisma.referral.create({
    data: {
      referrerId,
      code,
      email,
      status: 'pending',
    },
  })
}

export async function trackReferralSignup(code: string, referredUserId: string) {
  const referral = await prisma.referral.findUnique({
    where: { code },
    include: { referrer: true },
  })
  
  if (!referral || referral.status !== 'pending') {
    return null
  }
  
  // Update referral status
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      referredId: referredUserId,
      status: 'signed_up',
    },
  })
  
  // Update referred user
  await prisma.user.update({
    where: { id: referredUserId },
    data: { referredBy: referral.referrerId },
  })
  
  return referral
}

export async function awardReferralCredits(referredUserId: string) {
  const referral = await prisma.referral.findFirst({
    where: { referredId: referredUserId },
    include: { referrer: true },
  })
  
  if (!referral || referral.status === 'converted' || referral.creditsAwarded > 0) {
    return null
  }
  
  // Award credits to referrer
  await prisma.user.update({
    where: { id: referral.referrerId },
    data: {
      credits: { increment: REFERRAL_CREDITS },
    },
  })
  
  // Mark referral as converted
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: 'converted',
      creditsAwarded: REFERRAL_CREDITS,
    },
  })
  
  return {
    referrerId: referral.referrerId,
    creditsAwarded: REFERRAL_CREDITS,
  }
}

export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    orderBy: { createdAt: 'desc' },
  })
  
  const stats = {
    total: referrals.length,
    signedUp: referrals.filter(r => r.status === 'signed_up' || r.status === 'converted').length,
    converted: referrals.filter(r => r.status === 'converted').length,
    totalCredits: referrals.reduce((sum, r) => sum + r.creditsAwarded, 0),
    referrals,
  }
  
  return stats
}

export async function getReferralByCode(code: string) {
  return prisma.referral.findUnique({
    where: { code },
    include: { referrer: { select: { name: true, email: true } } },
  })
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
