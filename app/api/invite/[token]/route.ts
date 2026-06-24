import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'

type Params = { params: Promise<{ token: string }> }

// POST — aceita convite
export async function POST(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const invite = await WorkspaceRepository.useInvite(token, user.id)
    return NextResponse.json({ workspaceId: invite.workspaceId })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao aceitar convite.' },
      { status: 400 }
    )
  }
}