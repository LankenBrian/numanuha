import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id?: string
    plan?: string
    credits?: number
  }
  
  interface Session {
    user: {
      id?: string
      plan?: string
      credits?: number
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    plan?: string
    credits?: number
  }
}
