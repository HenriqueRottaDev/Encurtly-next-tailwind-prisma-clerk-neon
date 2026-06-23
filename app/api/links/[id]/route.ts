import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateLinkSchema = z.object({
  disabled: z.boolean().optional(),
  title: z.string().max(100).optional(),
  url: z.string().url().optional(),
  slug: z.string().min(3).max(50).optional(),
  password: z.string().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  maxClicks: z.number().int().positive().optional().nullable(),
  ctaEnabled: z.boolean().optional(),
  ctaTitle: z.string().max(100).optional().nullable(),
  ctaMessage: z.string().max(300).optional().nullable(),
  ctaButtonText: z.string().max(50).optional().nullable(),
  ctaButtonUrl: z.string().url().optional().nullable(),
})

// PATCH — atualizar/pausar link
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { id } = await params
  const link = await LinkRepository.findById(id)

  if (!link || link.userId !== user.id) {
    return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = updateLinkSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { slug, password, expiresAt, ...rest } = parsed.data

  // Slug: se mudou, checa se já existe em outro link
  if (slug && slug !== link.slug) {
    const existing = await LinkRepository.findBySlug(slug)
    if (existing && existing.id !== link.id) {
      return NextResponse.json({ error: 'Slug já em uso' }, { status: 409 })
    }
  }

  // Senha: hash se veio um valor novo, mantém null se explicitamente limpa
  const hashedPassword =
    password !== undefined
      ? password
        ? await bcrypt.hash(password, 10)
        : null
      : undefined

  const updated = await LinkRepository.update(id, {
    ...rest,
    ...(slug !== undefined && { slug }),
    ...(hashedPassword !== undefined && { password: hashedPassword }),
    ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
  })

  return NextResponse.json(updated)
}

// DELETE — deletar link
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { id } = await params
  const link = await LinkRepository.findById(id)

  if (!link || link.userId !== user.id) {
    return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  await LinkRepository.delete(id)
  return NextResponse.json({ success: true })
}