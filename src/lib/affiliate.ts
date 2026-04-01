import { prisma } from './prisma'

const DEFAULT_COMMISSION_RATE = 0.30 // 30%

export async function createAffiliateApplication(userId: string, data: {
  website?: string
  paypalEmail: string
  notes?: string
}) {
  const code = generateAffiliateCode()
  
  return prisma.affiliate.create({
    data: {
      userId,
      code,
      status: 'pending',
      commissionRate: DEFAULT_COMMISSION_RATE,
      paypalEmail: data.paypalEmail,
      website: data.website,
      notes: data.notes,
    },
  })
}

export async function getAffiliateByCode(code: string) {
  return prisma.affiliate.findUnique({
    where: { code },
    include: { user: { select: { name: true, email: true } } },
  })
}

export async function getAffiliateByUserId(userId: string) {
  return prisma.affiliate.findUnique({
    where: { userId },
    include: {
      conversions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })
}

export async function trackAffiliateConversion(
  affiliateCode: string,
  customerId: string,
  subscriptionId: string,
  amount: number
) {
  const affiliate = await getAffiliateByCode(affiliateCode)
  
  if (!affiliate || affiliate.status !== 'approved') {
    return null
  }

  const commission = amount * Number(affiliate.commissionRate)

  const [conversion, updatedAffiliate] = await prisma.$transaction([
    prisma.affiliateConversion.create({
      data: {
        affiliateId: affiliate.id,
        customerId,
        subscriptionId,
        amount,
        commission,
        status: 'pending',
      },
    }),
    prisma.affiliate.update({
      where: { id: affiliate.id },
      data: {
        totalSales: { increment: amount },
        totalCommission: { increment: commission },
        pendingCommission: { increment: commission },
      },
    }),
  ])

  return { conversion, commission }
}

export async function getAffiliateStats(affiliateId: string) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    include: {
      conversions: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!affiliate) return null

  const conversions = affiliate.conversions
  const totalConversions = conversions.length
  const paidConversions = conversions.filter(c => c.status === 'paid').length
  const pendingConversions = conversions.filter(c => c.status === 'pending').length

  // Calculate monthly stats
  const now = new Date()
  const thisMonth = conversions.filter(c => 
    c.createdAt.getMonth() === now.getMonth() && 
    c.createdAt.getFullYear() === now.getFullYear()
  )
  const lastMonth = conversions.filter(c => {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return c.createdAt.getMonth() === lastMonth.getMonth() && 
           c.createdAt.getFullYear() === lastMonth.getFullYear()
  })

  return {
    overview: {
      totalSales: affiliate.totalSales,
      totalCommission: affiliate.totalCommission,
      pendingCommission: affiliate.pendingCommission,
      paidCommission: affiliate.paidCommission,
      commissionRate: affiliate.commissionRate,
    },
    conversions: {
      total: totalConversions,
      paid: paidConversions,
      pending: pendingConversions,
    },
    monthly: {
      thisMonth: {
        sales: thisMonth.reduce((sum, c) => sum + Number(c.amount), 0),
        commission: thisMonth.reduce((sum, c) => sum + Number(c.commission), 0),
      },
      lastMonth: {
        sales: lastMonth.reduce((sum, c) => sum + Number(c.amount), 0),
        commission: lastMonth.reduce((sum, c) => sum + Number(c.commission), 0),
      },
    },
    recentConversions: conversions.slice(0, 10),
  }
}

export async function approveAffiliate(affiliateId: string) {
  return prisma.affiliate.update({
    where: { id: affiliateId },
    data: { status: 'approved' },
  })
}

export async function rejectAffiliate(affiliateId: string) {
  return prisma.affiliate.update({
    where: { id: affiliateId },
    data: { status: 'rejected' },
  })
}

export async function payAffiliateCommission(conversionId: string) {
  const conversion = await prisma.affiliateConversion.update({
    where: { id: conversionId },
    data: { 
      status: 'paid',
      paidAt: new Date(),
    },
  })

  await prisma.affiliate.update({
    where: { id: conversion.affiliateId },
    data: {
      pendingCommission: { decrement: Number(conversion.commission) },
      paidCommission: { increment: Number(conversion.commission) },
    },
  })

  return conversion
}

export async function getAllAffiliates(status?: string) {
  return prisma.affiliate.findMany({
    where: status ? { status } : undefined,
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      _count: {
        select: { conversions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
