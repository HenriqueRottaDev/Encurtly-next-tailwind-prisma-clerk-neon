import { NextResponse } from 'next/server'
import { LinkRepository, ClickRepository, UserRepository } from '@/lib/repositories'
import { extractClickInfo } from '@/lib/utils/click-info'
import { checkClickLimit } from '@/lib/utils/check-limits'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const link = await LinkRepository.findBySlug(id)

  if (!link || link.disabled) {
    return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  const owner = await UserRepository.findById(link.userId)

  if (owner) {
    const clickLimitCheck = await checkClickLimit(owner.id, owner.plan)
    if (clickLimitCheck.allowed) {
      const clickInfo = await extractClickInfo(req.url)
      await ClickRepository.create({
        linkId: link.id,
        ...clickInfo,
      })
    }
  }

  return NextResponse.json({ url: link.url })
}