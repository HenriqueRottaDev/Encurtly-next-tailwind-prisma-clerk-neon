import { NextResponse } from 'next/server'
import { LinkRepository, ClickRepository } from '@/lib/repositories'
import { extractClickInfo } from '@/lib/utils/click-info'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { password } = await req.json()

  const link = await LinkRepository.findBySlug(id)

  if (!link) {
    return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  if (link.maxClicks) {
    const clickCount = await ClickRepository.countByLinkId(link.id)
    if (clickCount >= link.maxClicks) {
      return NextResponse.json({ error: 'Link expirado' }, { status: 410 })
    }
  }

  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.json({ error: 'Link expirado' }, { status: 410 })
  }

  if (link.password !== password) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const clickInfo = await extractClickInfo(req.url)

  await ClickRepository.create({
    linkId: link.id,
    ...clickInfo,
  })

  return NextResponse.json({ url: link.url })
}