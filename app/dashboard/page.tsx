import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { LinksDashboard } from '@/components/links/links-dashboard'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import { BulkUpload } from '@/components/links/bulk-upload'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  const initialData = await LinkRepository.findByUserIdPaginated(user.id, 1, 10)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const linkIds = initialData.links.map((l) => l.id)
  const clicksThisMonth = linkIds.length > 0
    ? await prisma.click.count({
        where: { linkId: { in: linkIds }, createdAt: { gte: startOfMonth } },
      })
    : 0

  return (
    <div className="space-y-6">
      <PlanUsage
        plan={user.plan}
        linksUsed={initialData.total}
        clicksUsed={clicksThisMonth}
        cancelAtPeriodEnd={user.stripeCancelAtPeriodEnd}
        currentPeriodEnd={user.stripeCurrentPeriodEnd}
      />
      <LinksDashboard initialData={initialData} isPro={user.plan !== 'FREE'} />
      <BulkUpload isPro={user.plan !== 'FREE'} />
    </div>
  )
}