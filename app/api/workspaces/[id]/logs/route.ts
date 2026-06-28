import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { WorkspaceLogRepository } from '@/lib/repositories/workspace-log.repository'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Só ADMIN pode ver logs
  const member = await WorkspaceRepository.getMember(id, user.id)
  if (!member || member.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Plano check — só Agência
  const workspace = await WorkspaceRepository.findById(id)
  if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const owner = workspace.members[0]
  const ownerUser = await UserRepository.findById(owner.userId)
  if (!ownerUser || ownerUser.plan !== 'AGENCY') {
    return NextResponse.json(
      { error: 'Logs disponíveis apenas no plano Agência.' },
      { status: 403 }
    )
  }

  const logs = await WorkspaceLogRepository.findByWorkspaceId(id)
  return NextResponse.json(logs)
}