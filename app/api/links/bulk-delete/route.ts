import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'Nenhum link selecionado.' }, { status: 400 })
  }

  // IDOR — garante que todos os links pertencem ao usuário
  const links = await prisma.link.findMany({
    where: { id: { in: ids }, userId: user.id },
    select: { id: true },
  })

  const validIds = links.map((l) => l.id)

  await prisma.link.deleteMany({ where: { id: { in: validIds } } })

  return NextResponse.json({ deleted: validIds.length })
}