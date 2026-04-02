import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 创建 Prisma 客户端的函数
function createPrismaClient() {
  // 检查是否在 Edge Runtime 环境
  if (process.env.NEXT_RUNTIME === 'edge' || typeof (globalThis as any).EdgeRuntime === 'string') {
    // Edge Runtime: 使用 Neon serverless 驱动
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined')
    }
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)
    return new PrismaClient({ adapter })
  } else {
    // Node.js Runtime: 使用默认驱动
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
