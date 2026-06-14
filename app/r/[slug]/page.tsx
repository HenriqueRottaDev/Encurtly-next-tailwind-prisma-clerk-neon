import { redirect } from 'next/navigation'
import { LinkRepository, ClickRepository } from '@/lib/repositories'
import { extractClickInfo } from '@/lib/utils/click-info'
import { PasswordForm } from '@/components/links/password-form'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LinkPage({ params }: PageProps) {
  const { slug } = await params

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

  await ClickRepository.create({
    linkId: link.id,
    ...clickInfo,
  })

  redirect(link.url)
}