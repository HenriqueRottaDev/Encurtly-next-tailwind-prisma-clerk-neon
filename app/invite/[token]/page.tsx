import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { AcceptInviteCard } from '@/components/workspaces/accept-invite-card'


interface PageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect(`/sign-in?redirect_url=/invite/${token}`)
  }

  const invite = await WorkspaceRepository.findInviteByToken(token)

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Convite inválido</h1>
          <p className="text-sm text-muted-foreground">Este link de convite não existe ou foi removido.</p>
        </div>
      </div>
    )
  }

  if (invite.usedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Convite já utilizado</h1>
          <p className="text-sm text-muted-foreground">Este link de convite já foi usado.</p>
        </div>
      </div>
    )
  }

  if (new Date() > invite.expiresAt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold">Convite expirado</h1>
          <p className="text-sm text-muted-foreground">Este link de convite expirou. Peça um novo ao administrador.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AcceptInviteCard token={token} workspaceName={invite.workspace.name} role={invite.role} />
    </div>
  )
}

// Client component inline