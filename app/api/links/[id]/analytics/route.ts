import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UserRepository, LinkRepository, ClickRepository } from '@/lib/repositories'
import { WorkspaceRepository } from '@/lib/repositories/workspace.repository'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const { id } = await params
  const link = await LinkRepository.findById(id)

  if (!link) return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  if (link.userId !== user.id) {
    if (!link.workspaceId) return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
    const member = await WorkspaceRepository.getMember(link.workspaceId, user.id)
    if (!member) return NextResponse.json({ error: 'Link não encontrado' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const rawDays = parseInt(searchParams.get('days') ?? '30')

  // Valida: se não for um número válido, ou estiver fora do range permitido, usa o padrão
  const ALLOWED_RANGES = [7, 14, 30, 90]
  const days = ALLOWED_RANGES.includes(rawDays) ? rawDays : 30

  const analytics = await ClickRepository.getLinkAnalytics(id, days)

  return NextResponse.json(analytics)
}