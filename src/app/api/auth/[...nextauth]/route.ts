// 删除旧的 NextAuth 路由，使用新的 Edge 兼容认证
// 这个文件重定向到新的 session 路由

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  // 重定向到新的 session 路由
  return NextResponse.redirect(new URL('/api/auth/session', request.url))
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/auth/session', request.url))
}
