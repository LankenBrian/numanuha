import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BG Remover Pro - AI Background Removal Tool',
  description: 'Remove image backgrounds instantly with AI. Perfect for e-commerce, social media, and product photography. Free tier available.',
  keywords: ['background remover', 'AI image editing', 'remove background', 'product photography', 'e-commerce tools'],
  authors: [{ name: 'BG Remover Pro' }],
  openGraph: {
    title: 'BG Remover Pro - AI Background Removal Tool',
    description: 'Remove image backgrounds instantly with AI. Perfect for e-commerce, social media, and product photography.',
    type: 'website',
    url: 'https://bgremover.pro',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BG Remover Pro',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BG Remover Pro - AI Background Removal Tool',
    description: 'Remove image backgrounds instantly with AI.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}
