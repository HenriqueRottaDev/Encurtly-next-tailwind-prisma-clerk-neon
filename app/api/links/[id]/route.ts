import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { z } from 'zod'

const updateLinkSchema = z.object({
  disabled: z.boolean().optional(),
  title: z.string().optional(),
  url: z.string().url().optional(),
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

  const updated = await LinkRepository.update(id, parsed.data)
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