import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { LinksDashboard } from '@/components/links/links-dashboard'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  const links = await LinkRepository.findByUserId(user.id)

  return <LinksDashboard links={links} />
}