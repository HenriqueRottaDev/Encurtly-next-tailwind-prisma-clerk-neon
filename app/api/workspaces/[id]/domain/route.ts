import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'
import { CustomDomainRepository } from '@/lib/repositories/custom-domain.repository'
import { addDomainToVercel, removeDomainFromVercel, getDomainStatus } from '@/lib/services/vercel-domains'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await WorkspaceRepository.getMember(id, user.id)
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const domain = await CustomDomainRepository.findByWorkspaceId(id)
  if (!domain) return NextResponse.json(null)

  const status = await getDomainStatus(domain.domain)
  if (status.verified && !domain.verified) {
    await CustomDomainRepository.setVerified(domain.id, true)
  }

  return NextResponse.json({ ...domain, ...status })
}

export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await WorkspaceRepository.getMember(id, user.id)
  if (!member || member.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (user.plan !== 'AGENCY') {
    return NextResponse.json(
      { error: 'Domínios por workspace disponíveis apenas no plano Agência.' },
      { status: 403 }
    )
  }

  // Conta domínios de workspace do usuário (máx 10)
  const allWorkspaces = await WorkspaceRepository.findByUserId(user.id)
  const adminWorkspaces = allWorkspaces.filter(
    (ws) => ws.members[0]?.userId === user.id
  )
  const domainsCount = await Promise.all(
    adminWorkspaces.map((ws) => CustomDomainRepository.findByWorkspaceId(ws.id))
  )
  const usedDomains = domainsCount.filter(Boolean).length

  if (usedDomains >= 10) {
    return NextResponse.json(
      { error: 'Limite de 10 domínios por conta atingido.' },
      { status: 409 }
    )
  }

  const existing = await CustomDomainRepository.findByWorkspaceId(id)
  if (existing) {
    return NextResponse.json(
      { error: 'Este workspace já possui um domínio personalizado.' },
      { status: 409 }
    )
  }

  const { domain } = await req.json()
  if (!domain?.trim()) return NextResponse.json({ error: 'Domínio obrigatório.' }, { status: 400 })

  const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  const domainInUse = await CustomDomainRepository.findByDomain(normalized)
  if (domainInUse) return NextResponse.json({ error: 'Este domínio já está em uso.' }, { status: 409 })

  await addDomainToVercel(normalized)
  const created = await CustomDomainRepository.createForWorkspace(id, normalized)

  return NextResponse.json(created, { status: 201 })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await WorkspaceRepository.getMember(id, user.id)
  if (!member || member.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const domain = await CustomDomainRepository.findByWorkspaceId(id)
  if (!domain) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await removeDomainFromVercel(domain.domain)
  await CustomDomainRepository.delete(domain.id)

  return NextResponse.json({ success: true })
}