import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { Role } from '@prisma/client'

import { WorkspaceLogRepository } from '@/lib/repositories/workspace-log.repository'
import { UserRepository as UR } from '@/lib/repositories'

type Params = { params: Promise<{ id: string }> }

// PATCH — atualiza role de membro (só ADMIN)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await WorkspaceRepository.getMember(id, user.id)
  if (!member || member.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { targetUserId, role } = await req.json()
  if (!targetUserId || !role) {
    return NextResponse.json({ error: 'targetUserId e role obrigatórios.' }, { status: 400 })
  }

  if (!['ADMIN', 'EDITOR', 'VIEWER'].includes(role)) {
    return NextResponse.json({ error: 'Role inválido.' }, { status: 400 })
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: 'Não é possível alterar seu próprio role.' }, { status: 400 })
  }

  // Busca workspace para identificar o criador
  const workspace = await WorkspaceRepository.findById(id)
  if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const originalAdminId = workspace.members[0].userId

  if (targetUserId === originalAdminId && user.id !== originalAdminId) {
    return NextResponse.json(
      { error: 'Não é possível alterar o role do criador do workspace.' },
      { status: 403 }
    )
  }

  const updated = await WorkspaceRepository.updateMemberRole(id, targetUserId, role as Role)
  const targetUser = await UR.findById(targetUserId)
  await WorkspaceLogRepository.create({
    workspaceId: id,
    userId: user.id,
    action: 'member.role_changed',
    description: `Alterou o role de ${targetUser?.name || targetUser?.email || targetUserId} para ${role}`,
  })

  return NextResponse.json(updated)
}

// DELETE — remove membro (só ADMIN)
export async function DELETE(req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await WorkspaceRepository.getMember(id, user.id)
  if (!member || member.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { targetUserId } = await req.json()
  if (!targetUserId) {
    return NextResponse.json({ error: 'targetUserId obrigatório.' }, { status: 400 })
  }

  if (targetUserId === user.id) {
    return NextResponse.json({ error: 'Não é possível remover a si mesmo.' }, { status: 400 })
  }

  // Busca workspace para identificar o criador
  const workspace = await WorkspaceRepository.findById(id)
  if (!workspace) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const originalAdminId = workspace.members[0].userId

  if (targetUserId === originalAdminId) {
    return NextResponse.json(
      { error: 'Não é possível remover o criador do workspace.' },
      { status: 403 }
    )
  }

  await WorkspaceRepository.removeMember(id, targetUserId)
  const removedUser = await UR.findById(targetUserId)
  await WorkspaceLogRepository.create({
    workspaceId: id,
    userId: user.id,
    action: 'member.removed',
    description: `Removeu ${removedUser?.name || removedUser?.email || targetUserId} do workspace`,
  })

  return NextResponse.json({ success: true })
}