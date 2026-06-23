import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { LinkRepository, UserRepository } from '@/lib/repositories'
import { RedirectRuleRepository } from '@/lib/repositories/redirect-rule.repository'

type Params = { params: Promise<{ id: string; ruleId: string }> }

// PATCH — atualiza regra
export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ruleId } = await params

  const link = await LinkRepository.findById(id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user || link.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rule = await RedirectRuleRepository.findById(ruleId)
  if (!rule || rule.linkId !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const updated = await RedirectRuleRepository.update(ruleId, body)

  return NextResponse.json(updated)
}

// DELETE — remove regra
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, ruleId } = await params

  const link = await LinkRepository.findById(id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user || link.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rule = await RedirectRuleRepository.findById(ruleId)
  if (!rule || rule.linkId !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await RedirectRuleRepository.delete(ruleId)
  return NextResponse.json({ success: true })
}