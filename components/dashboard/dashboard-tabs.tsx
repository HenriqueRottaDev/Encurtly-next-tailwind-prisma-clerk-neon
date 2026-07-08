'use client'

import { useState } from 'react'
import { Link2, FileText, Gauge } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinksDashboard } from '@/components/links/links-dashboard'
import { BulkUpload } from '@/components/links/bulk-upload'
import { ReportButtons } from '@/components/reports/report-buttons'
import { PlanUsageCard } from '@/components/dashboard/plan-usage-card'
import { PlanType } from '@/lib/plans'
import { LinkWithClickCount, PaginatedLinks } from '@/lib/repositories/link.repository'

interface WorkspaceTopLink extends LinkWithClickCount {
  workspaceName: string
  workspaceId: string
}

interface UserWorkspace {
  id: string
  name: string
}

interface DashboardTabsProps {
  plan: PlanType
  initialData: PaginatedLinks
  workspaceTopLinks: WorkspaceTopLink[]
  userWorkspaces: UserWorkspace[]
  linksUsed: number
  clicksUsed: number
  cancelAtPeriodEnd?: boolean
  currentPeriodEnd?: Date | null
}

type Tab = 'links' | 'reports' | 'usage'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'links', label: 'Meus Links', icon: <Link2 className="h-3.5 w-3.5" /> },
  { id: 'reports', label: 'Relatórios', icon: <FileText className="h-3.5 w-3.5" /> },
  { id: 'usage', label: 'Uso do plano', icon: <Gauge className="h-3.5 w-3.5" /> },
]

export function DashboardTabs({
  plan,
  initialData,
  workspaceTopLinks,
  userWorkspaces,
  linksUsed,
  clicksUsed,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: DashboardTabsProps) {
  const [tab, setTab] = useState<Tab>('links')
  const isPro = plan === 'PRO' || plan === 'AGENCY'

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {tab === 'links' && (
        <div className="space-y-6">
          <LinksDashboard
            initialData={initialData}
            isPro={isPro}
            workspaceTopLinks={workspaceTopLinks}
            userWorkspaces={userWorkspaces}
          />
          <BulkUpload isPro={isPro} />
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Relatórios</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Exporte o desempenho dos seus links em CSV ou PDF
            </p>
          </div>
          <ReportButtons plan={plan} />
        </div>
      )}

      {tab === 'usage' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Uso do plano</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acompanhe seu consumo de links e cliques
            </p>
          </div>
          <PlanUsageCard
            plan={plan}
            linksUsed={linksUsed}
            clicksUsed={clicksUsed}
            cancelAtPeriodEnd={cancelAtPeriodEnd}
            currentPeriodEnd={currentPeriodEnd}
          />
        </div>
      )}
    </div>
  )
}