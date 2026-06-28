import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { LinksDashboard } from '@/components/links/links-dashboard'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import { BulkUpload } from '@/components/links/bulk-upload'
import { prisma } from '@/lib/prisma'
import { ReportButtons } from '@/components/reports/report-buttons'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  const initialData = await LinkRepository.findByUserIdPaginated(user.id, 1, 10)

  // Top link de cada workspace que o usuário pertence
  const workspaces = await WorkspaceRepository.findByUserId(user.id)
  const workspaceTopLinks = await Promise.all(
    workspaces.map(async (ws) => {
      const link = await WorkspaceRepository.findTopLinkByWorkspaceId(ws.id)
      return link ? { ...link, workspaceName: ws.name, workspaceId: ws.id } : null
    })
  )
  const filteredTopLinks = workspaceTopLinks.filter((l): l is NonNullable<typeof l> => l !== null)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const linkIds = initialData.links.map((l) => l.id)
  const clicksThisMonth = linkIds.length > 0
    ? await prisma.click.count({
      where: { linkId: { in: linkIds }, createdAt: { gte: startOfMonth } },
    })
    : 0

  return (
    <div className="space-y-6">
      <PlanUsage
        plan={user.plan}
        linksUsed={initialData.total}
        clicksUsed={clicksThisMonth}
        cancelAtPeriodEnd={user.stripeCancelAtPeriodEnd}
        currentPeriodEnd={user.stripeCurrentPeriodEnd}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Relatórios</h2>
        <ReportButtons plan={user.plan} />
      </div>
      <LinksDashboard
        initialData={initialData}
        isPro={user.plan !== 'FREE'}
        workspaceTopLinks={filteredTopLinks}
        userWorkspaces={workspaces.map((ws) => ({ id: ws.id, name: ws.name }))}
      />
      <BulkUpload isPro={user.plan !== 'FREE'} />
    </div>
  )
}