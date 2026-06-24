import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories'
import { CustomDomainRepository } from '@/lib/repositories/custom-domain.repository'
import { removeDomainFromVercel, getDomainStatus } from '@/lib/services/vercel-domains'

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

  const record = await CustomDomainRepository.findByUserId(user.id)
  if (!record || record.id !== id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await removeDomainFromVercel(record.domain)
  await CustomDomainRepository.delete(record.id)

  return NextResponse.json({ success: true })
}