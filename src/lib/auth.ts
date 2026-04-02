// 服务端认证工具 - Edge Runtime 兼容
import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from './prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  
  const payload = await verifyToken(token)
  if (!payload?.email) return null
  
  const user = await prisma.user.findUnique({
    where: { email: payload.email as string },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      credits: true,
      image: true,
      stripeCurrentPeriodEnd: true,
      createdAt: true,
    }
  })
  
  return user
}
