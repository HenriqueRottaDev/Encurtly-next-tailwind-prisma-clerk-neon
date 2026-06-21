import { NextResponse } from 'next/server'
import { LinkRepository, ClickRepository } from '@/lib/repositories'
import { extractClickInfo } from '@/lib/utils/click-info'
import { verifyPasswordLimiter } from '@/lib/rate-limit'
import bcrypt from 'bcryptjs'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Identifica por IP (Vercel injeta esse header) + slug do link
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { success, reset } = await verifyPasswordLimiter.limit(`${ip}:${id}`)

  if (!success) {
    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em alguns instantes.' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
    )
  }

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

  const isValid = link.password ? await bcrypt.compare(password, link.password) : false
  if (!isValid) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  const clickInfo = await extractClickInfo(req.url)

  await ClickRepository.create({
    linkId: link.id,
    ...clickInfo,
  })

  return NextResponse.json({ url: link.url })
}