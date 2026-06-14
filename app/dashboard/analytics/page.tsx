import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { prisma } from '@/lib/prisma'
import { AnalyticsOverview } from '@/components/analytics/analytics-overview'

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  const links = await LinkRepository.findByUserId(user.id)
  const linkIds = links.map(l => l.id)

  const totalClicks = linkIds.length > 0
    ? await prisma.click.count({ where: { linkId: { in: linkIds } } })
    : 0

  const topLinks = [...links]
    .sort((a, b) => b._count.clicks - a._count.clicks)
    .slice(0, 5)
    .map(l => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      clicks: l._count.clicks,
    }))

  const clicksByDayRaw = linkIds.length > 0
    ? await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
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
    : []

  const clicksByDay = clicksByDayRaw.map(row => ({
    date: row.date.toISOString().split('T')[0],
    count: Number(row.count),
  }))

  return (
    <AnalyticsOverview
      totalLinks={links.length}
      totalClicks={totalClicks}
      topLinks={topLinks}
      clicksByDay={clicksByDay}
    />
  )
}