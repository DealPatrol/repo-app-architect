// RepoFuse Layout - v1.2
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'RepoFuse - Discover Apps Hidden in Your Code',
  description: 'AI-powered GitHub repository analyzer that discovers what apps you can build from your existing code',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-black">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-black text-foreground min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {/* Grid background */}
          <div className="fixed inset-0 -z-10 opacity-[0.03]">
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: 'linear-gradient(rgba(0,229,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }} 
            />
          </div>
          {/* Glowing orbs */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
          <div className="fixed top-40 right-1/4 w-72 h-72 bg-orange-500/3 rounded-full blur-3xl -z-10" />
          
          <SiteHeader />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
