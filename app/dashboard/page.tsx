import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { prisma } from '@/lib/prisma'
import { TrialExpiredGate } from '@/components/dashboard/trial-expired-gate'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  if (user.plan === 'FREE') {
    return <TrialExpiredGate hasHadTrial={user.hasHadTrial} />
  }

  const initialData = await LinkRepository.findByUserIdPaginated(user.id, 1, 10)

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
    <DashboardTabs
      plan={user.plan}
      initialData={initialData}
      workspaceTopLinks={filteredTopLinks}
      userWorkspaces={workspaces.map((ws) => ({ id: ws.id, name: ws.name }))}
      linksUsed={initialData.total}
      clicksUsed={clicksThisMonth}
      cancelAtPeriodEnd={user.stripeCancelAtPeriodEnd}
      currentPeriodEnd={user.stripeCurrentPeriodEnd}
    />
  )
}