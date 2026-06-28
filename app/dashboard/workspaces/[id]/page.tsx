import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { UserRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { WorkspaceDetail } from '@/components/workspaces/workspace-detail'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function WorkspaceDetailPage({ params }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  const workspace = await WorkspaceRepository.findById(id)
  if (!workspace) notFound()

  const member = await WorkspaceRepository.getMember(id, user.id)
  if (!member) redirect('/dashboard/workspaces')

  const initialLinks = await WorkspaceRepository.findLinksByWorkspaceId(id)

  const ownerMember = workspace.members[0]
  const ownerUser = await UserRepository.findById(ownerMember.userId)

  return (
    <WorkspaceDetail
      workspace={workspace}
      currentUserId={user.id}
      currentUserRole={member.role}
      initialLinks={initialLinks}
      isAgency={ownerUser?.plan === 'AGENCY'}
    />
  )
}