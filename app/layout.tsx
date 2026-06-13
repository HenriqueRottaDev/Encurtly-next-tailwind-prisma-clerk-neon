import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Encurtly — Links inteligentes',
  description: 'Encurte, rastreie e gerencie seus links com analytics completo.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}