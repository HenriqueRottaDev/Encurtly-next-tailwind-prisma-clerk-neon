import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { WorkspacesDashboard } from '@/components/workspaces/workspaces-dashboard'

export default async function WorkspacesPage() {
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')

    const user = await UserRepository.findByClerkId(userId)
    if (!user) redirect('/sign-in')

    const workspaces = await WorkspaceRepository.findByUserId(user.id)

    return (
        <WorkspacesDashboard
            workspaces={workspaces}
            isAgency={user.plan === 'AGENCY' || workspaces.length > 0}
            userId={user.id}
        />
    )
}