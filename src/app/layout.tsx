import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Robot Food — AI Recipe Assistant',
  description: 'AI-powered recipe suggestions based on ingredients you have.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://robot-food.com'),
  openGraph: {
    title: 'Robot Food — AI Recipe Assistant',
    description: 'Tell it what\'s in your fridge. Get instant recipe ideas powered by Claude AI.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Robot Food — AI Recipe Assistant',
    description: 'Tell it what\'s in your fridge. Get instant recipe ideas powered by Claude AI.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Toaster>
            {children}
          </Toaster>
        </Providers>
      </body>
    </html>
  )
}
