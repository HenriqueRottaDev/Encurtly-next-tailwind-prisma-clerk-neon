import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { generateUniqueSlug, isValidSlug } from '@/lib/utils/slug'
import { z } from 'zod'
import { checkLinkLimit } from '@/lib/utils/check-limits'

const createLinkSchema = z.object({
  url: z.string().url('URL inválida — certifique-se de incluir http:// ou https://'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').max(50, 'Slug deve ter no máximo 50 caracteres').optional(),
  title: z.string().max(100, 'Título deve ter no máximo 100 caracteres').optional(),
  password: z.string().optional(),
  expiresAt: z.string().datetime('Data de expiração inválida').optional(),
  maxClicks: z.number().int().positive('Máximo de cliques deve ser um número positivo').optional(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const links = await LinkRepository.findByUserId(user.id)
  return NextResponse.json(links)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const limitCheck = await checkLinkLimit(user.id, user.plan)
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: limitCheck.reason, upgradeRequired: true },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parsed = createLinkSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { url, slug, title, password, expiresAt, maxClicks } = parsed.data

  if (slug) {
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
    }
    const existing = await LinkRepository.findBySlug(slug)
    if (existing) {
      return NextResponse.json({ error: 'Slug já em uso' }, { status: 409 })
    }
  }

  const finalSlug = slug ?? await generateUniqueSlug()

  const link = await LinkRepository.create(user.id, {
    url,
    slug: finalSlug,
    title,
    password,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    maxClicks,
  })

  return NextResponse.json(link, { status: 201 })
}