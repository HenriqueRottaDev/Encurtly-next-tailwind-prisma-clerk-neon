import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Toaster } from '@/components/ui/sonner'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { NavLink } from '@/components/dashboard/nav-link'
import {
  Link2, BarChart3, CreditCard, Building2, Settings,
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            href="/dashboard"
            className="font-semibold text-lg tracking-tight text-primary shrink-0"
          >
            Encurtly
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
            <NavLink href="/dashboard" exact>
              <Link2 className="h-3.5 w-3.5" />
              Links
            </NavLink>
            <NavLink href="/dashboard/analytics">
              <BarChart3 className="h-3.5 w-3.5" />
              Analytics
            </NavLink>
            <NavLink href="/dashboard/workspaces">
              <Building2 className="h-3.5 w-3.5" />
              Workspaces
            </NavLink>
            <NavLink href="/pricing">
              <CreditCard className="h-3.5 w-3.5" />
              Planos
            </NavLink>
            <NavLink href="/dashboard/settings">
              <Settings className="h-3.5 w-3.5" />
              Configurações
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      <Toaster />
    </div>
  )
}