import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { LinkRepository, ClickRepository } from '@/lib/repositories'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { password } = await req.json()
  const headersList = await headers()

  const link = await LinkRepository.findBySlug(id)

  if (!link) {
    return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  // Verifica limite de cliques
  if (link.maxClicks) {
    const clickCount = await ClickRepository.countByLinkId(link.id)
    if (clickCount >= link.maxClicks) {
      return NextResponse.json({ error: 'Link expirado' }, { status: 410 })
    }
  }

  // Verifica expiração por data
  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.json({ error: 'Link expirado' }, { status: 410 })
  }

  if (link.password !== password) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  // Registra o clique após senha correta
  await ClickRepository.create({
    linkId: link.id,
    referrer: headersList.get('referer') ?? null,
  })

  return NextResponse.json({ url: link.url })
}