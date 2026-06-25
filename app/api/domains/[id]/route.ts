import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { CustomDomainRepository } from '@/lib/repositories/custom-domain.repository'
import { removeDomainFromVercel, getDomainStatus } from '@/lib/services/vercel-domains'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const record = await CustomDomainRepository.findByUserId(user.id)
  if (!record || record.id !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const status = await getDomainStatus(record.domain)

  if (status.verified && !record.verified) {
    await CustomDomainRepository.setVerified(record.id, true)
  }

  return NextResponse.json({ ...record, ...status })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Busca o domínio pelo ID direto
  const record = await prisma.customDomain.findUnique({ where: { id } })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Verifica se o usuário tem acesso — dono direto ou admin do workspace
  if (record.userId && record.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (record.workspaceId) {
    const { WorkspaceRepository } = await import('@/lib/repositories/workspace.repository')
    const member = await WorkspaceRepository.getMember(record.workspaceId, user.id)
    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  await removeDomainFromVercel(record.domain)
  await prisma.customDomain.delete({ where: { id } })

  return NextResponse.json({ success: true })
}