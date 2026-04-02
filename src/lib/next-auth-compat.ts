// NextAuth 兼容层 - 用于 Edge Runtime
// 模拟 next-auth 的 API，但实际使用 JWT

import { NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')

// 模拟 getServerSession
export async function getServerSession(req?: NextRequest) {
  if (!req) return null
  
  const token = req.cookies.get('auth-token')?.value
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      user: {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string,
        plan: payload.plan as string,
        credits: payload.credits as number,
        image: payload.image as string | null,
      }
    }
  } catch {
    return null
  }
}

// 模拟 getToken
export async function getToken({ req, secret }: { req: NextRequest; secret?: string }) {
  const token = req.cookies.get('auth-token')?.value
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

// 生成 JWT
export async function generateJWT(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}
