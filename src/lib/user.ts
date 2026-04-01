import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      plan: 'free',
      credits: 10,
    },
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  })
}

export async function updateUserPlan(userId: string, plan: 'free' | 'pro') {
  return prisma.user.update({
    where: { id: userId },
    data: { 
      plan,
      credits: plan === 'pro' ? -1 : 10, // -1 means unlimited for pro
    },
  })
}

export async function decrementCredits(userId: string) {
  const user = await getUserById(userId)
  if (!user) return null
  
  // Pro users have unlimited credits (-1)
  if (user.credits === -1) return user
  
  if (user.credits <= 0) {
    throw new Error('Insufficient credits')
  }
  
  return prisma.user.update({
    where: { id: userId },
    data: { 
      credits: { decrement: 1 },
      usageCount: { increment: 1 },
    },
  })
}

export async function logUsage(userId: string, action: string, status: 'success' | 'failed', metadata?: any) {
  return prisma.usageLog.create({
    data: {
      userId,
      action,
      status,
      creditsUsed: 1,
      metadata: metadata || {},
    },
  })
}

export async function getUsageStats(userId: string, days: number = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  
  const logs = await prisma.usageLog.findMany({
    where: {
      userId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: 'desc' },
  })
  
  const totalUsage = logs.length
  const successfulUsage = logs.filter(l => l.status === 'success').length
  const failedUsage = logs.filter(l => l.status === 'failed').length
  
  return {
    totalUsage,
    successfulUsage,
    failedUsage,
    logs,
  }
}
