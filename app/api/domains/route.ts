import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { CustomDomainRepository } from '@/lib/repositories/custom-domain.repository'
import { addDomainToVercel } from '@/lib/services/vercel-domains'

const PLAN_DOMAIN_LIMITS = {
  FREE: 0,
  PRO: 1,
  AGENCY: 10,
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const domain = await CustomDomainRepository.findByUserId(user.id)
  return NextResponse.json(domain ?? null) // 👈 garante que sempre retorna JSON
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (user.plan === 'FREE') {
    return NextResponse.json(
      { error: 'Domínios personalizados não estão disponíveis no plano Free.' },
      { status: 403 }
    )
  }

  // Pro só pode ter 1 domínio pessoal
  if (user.plan === 'PRO') {
    const existing = await CustomDomainRepository.findByUserId(user.id)
    if (existing) {
      return NextResponse.json(
        { error: 'Você já possui um domínio personalizado. O plano Pro permite apenas 1.' },
        { status: 409 }
      )
    }
  }

  const { domain } = await req.json()
  if (!domain?.trim()) return NextResponse.json({ error: 'Domínio obrigatório.' }, { status: 400 })

  const normalized = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  const existing = await CustomDomainRepository.findByDomain(normalized)
  if (existing) {
    return NextResponse.json({ error: 'Este domínio já está em uso.' }, { status: 409 })
  }

  await addDomainToVercel(normalized)
  const created = await CustomDomainRepository.createForUser(user.id, normalized)

  return NextResponse.json(created, { status: 201 })
}