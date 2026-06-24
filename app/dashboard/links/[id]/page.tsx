import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { UserRepository, LinkRepository, ClickRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { LinkAnalyticsView } from '@/components/analytics/link-analytics-view'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LinkAnalyticsPage({ params }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  const { id } = await params
  const link = await LinkRepository.findById(id)

  if (!link) notFound()

  // Verifica acesso — dono ou membro do workspace
  if (link.userId !== user.id) {
    if (!link.workspaceId) notFound()
    const member = await WorkspaceRepository.getMember(link.workspaceId, user.id)
    if (!member) notFound()
  }

  const analytics = await ClickRepository.getLinkAnalytics(id, 30)

  const isWorkspaceLink = !!link.workspaceId

  return (
    <LinkAnalyticsView
      link={link}
      analytics={analytics}
      isPro={user.plan !== 'FREE' || isWorkspaceLink}
    />
  )
}