import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { LinkRepository } from '@/lib/repositories'
import { UserRepository } from '@/lib/repositories'
import { RedirectRuleRepository } from '@/lib/repositories/redirect-rule.repository'

type Params = { params: Promise<{ id: string }> }

// GET — lista regras do link
export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const link = await LinkRepository.findById(id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user || link.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rules = await RedirectRuleRepository.findByLinkId(id)
  return NextResponse.json(rules)
}

// POST — cria nova regra
export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const link = await LinkRepository.findById(id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user || link.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (user.plan === 'FREE') {
    return NextResponse.json(
      { error: 'Redirect condicional disponível nos planos Pro e Agência.' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { type, condition, url, order } = body

  if (!type || !condition || !url) {
    return NextResponse.json({ error: 'type, condition e url são obrigatórios.' }, { status: 400 })
  }

  if (!['country', 'device', 'time'].includes(type)) {
    return NextResponse.json({ error: 'type inválido.' }, { status: 400 })
  }

  const rule = await RedirectRuleRepository.create({
    type,
    condition,
    url,
    order: order ?? 0,
    linkId: id,
  })

  return NextResponse.json(rule, { status: 201 })
}