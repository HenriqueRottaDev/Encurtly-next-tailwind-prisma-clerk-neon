import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const links = await LinkRepository.findByUserId(user.id)
  const linkIds = links.map(l => l.id)

  const totalClicks = await prisma.click.count({
    where: { linkId: { in: linkIds } },
  })

  const totalLinks = links.length

  // Top 5 links por cliques
  const topLinks = [...links]
    .sort((a, b) => b._count.clicks - a._count.clicks)
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      clicks: l._count.clicks,
    }))

  // Cliques totais ao longo do tempo (últimos 30 dias, todos os links)
  const clicksByDay = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
    SELECT
      DATE_TRUNC('day', c."createdAt") AS date,
      COUNT(*) AS count
    FROM "Click" c
    INNER JOIN "Link" l ON c."linkId" = l.id
    WHERE l."userId" = ${user.id}
      AND c."createdAt" >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', c."createdAt")
    ORDER BY date ASC
  `

  return NextResponse.json({
    totalLinks,
    totalClicks,
    topLinks,
    clicksByDay: clicksByDay.map(row => ({
      date: row.date.toISOString().split('T')[0],
      count: Number(row.count),
    })),
  })
}