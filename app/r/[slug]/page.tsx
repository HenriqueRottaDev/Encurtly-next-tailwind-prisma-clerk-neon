import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { LinkRepository, ClickRepository, UserRepository } from '@/lib/repositories'
import { extractClickInfo } from '@/lib/utils/click-info'
import { PasswordForm } from '@/components/links/password-form'
import { checkClickLimit } from '@/lib/utils/check-limits'
import { redirectLimiter } from '@/lib/rate-limit'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LinkPage({ params }: PageProps) {
  const { slug } = await params

  // Rate limit por IP, para evitar flood de cliques automatizados
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const { success } = await redirectLimiter.limit(ip)

  if (!success) {
    redirect('/')
  }

  const link = await LinkRepository.findBySlug(slug)

  if (!link || link.disabled) redirect('/')

  if (link.expiresAt && new Date() > link.expiresAt) redirect('/')

  if (link.maxClicks) {
    const clickCount = await ClickRepository.countByLinkId(link.id)
    if (clickCount >= link.maxClicks) redirect('/')
  }

  if (link.password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <PasswordForm slug={slug} />
      </div>
    )
  }

  // Captura dados detalhados do clique
  const clickInfo = await extractClickInfo(`https://encurtly.com.br/r/${slug}`)

  const owner = await UserRepository.findById(link.userId)
  if (owner) {
    const clickLimitCheck = await checkClickLimit(owner.id, owner.plan)
    if (clickLimitCheck.allowed) {
      await ClickRepository.create({
        linkId: link.id,
        ...clickInfo,
      })
    }
  }

  redirect(link.url)
}