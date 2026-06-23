import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { UserRepository, LinkRepository, ClickRepository } from '@/lib/repositories'
import { LinkAnalyticsView } from '@/components/analytics/link-analytics-view' 

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LinkAnalyticsPage({ params }: PageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  const { id } = await params
  const link = await LinkRepository.findById(id)

  if (!link || link.userId !== user.id) notFound()

  const analytics = await ClickRepository.getLinkAnalytics(id, 30)

  return <LinkAnalyticsView link={link} analytics={analytics} isPro={user.plan !== 'FREE'} />
}