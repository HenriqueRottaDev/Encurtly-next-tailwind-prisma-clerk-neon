import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

// GET — listar links do usuário
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const links = await prisma.link.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { clicks: true } } },
  })

  return NextResponse.json(links)
}

// POST — criar link
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await req.json()
  const parsed = createLinkSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { url, slug, title, password, expiresAt, maxClicks } = parsed.data

  // Valida slug customizado
  if (slug) {
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
    }
    const existing = await prisma.link.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug já em uso' }, { status: 409 })
    }
  }

  const finalSlug = slug ?? await generateUniqueSlug()

  const link = await prisma.link.create({
    data: {
      url,
      slug: finalSlug,
      title,
      password,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxClicks,
      userId: user.id,
    },
  })

  return NextResponse.json(link, { status: 201 })
}