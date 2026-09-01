import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pharma POS · Fast Checkout for Kenyan Pharmacies',
  description: 'Cloud pharmacy POS with instant M-Pesa STK Push checkout, FEFO batch inventory tracking, expiry management, and an AI business copilot. Built for Kenyan retail pharmacies and chemists.',
  generator: 'pharmapos',
  applicationName: 'Pharma POS',
  keywords: ['pharmacy POS', 'M-Pesa STK Push', 'Kenya pharmacy software', 'chemist POS', 'inventory management', 'FEFO', 'pharmacy operating system'],
  authors: [{ name: 'QuantIQ', url: 'https://quantiq.co.ke' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon-light-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', sizes: '32x32', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: 'Pharma POS · Fast Checkout for Kenyan Pharmacies',
    description: 'Cloud pharmacy POS with instant M-Pesa STK Push checkout, FEFO batch inventory, and an AI business copilot.',
    siteName: 'Pharma POS',
    url: 'https://pos.quantiq.co.ke',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#f7f9f8]">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
