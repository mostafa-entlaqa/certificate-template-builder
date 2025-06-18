import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Certificate Builder',
  description: 'Create beautiful certificates with ease',
  generator: 'Certificate Builder',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
