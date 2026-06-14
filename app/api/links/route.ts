import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { generateUniqueSlug, isValidSlug } from '@/lib/utils/slug'
import { z } from 'zod'

const createLinkSchema = z.object({
  url: z.string().url('URL inválida'),
  slug: z.string().optional(),
  title: z.string().optional(),
  password: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  maxClicks: z.number().int().positive().optional(),
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