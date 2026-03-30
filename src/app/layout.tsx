import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Background Remover - Professional Product Photos',
  description: 'Remove image backgrounds instantly with AI. Perfect for Amazon, Shopify, eBay, and social media.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}