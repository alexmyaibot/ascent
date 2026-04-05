import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ServiceWorkerRegister } from './service-worker-register'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geist_mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Ascent - Climbing Tracker',
  description: 'Track Owen climbing progress with time, difficulty, and photos',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ascent',
  },
  icons: [
    {
      rel: 'icon',
      url: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/icon-192.png',
      sizes: '192x192',
    },
  ],
  formatDetection: {
    telephone: false,
  },
  themeColor: '#10b981',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ascent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#10b981" />
      </head>
      <body className={`${geist.variable} ${geist_mono.variable} antialiased`}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
