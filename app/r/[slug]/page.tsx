import { redirect } from 'next/navigation'
import { LinkRepository, ClickRepository } from '@/lib/repositories'
import { headers } from 'next/headers'
import { PasswordForm } from '@/components/links/password-form'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LinkPage({ params }: PageProps) {
  const { slug } = await params
  const headersList = await headers()

  const link = await LinkRepository.findBySlug(slug)

  // Link não encontrado ou desativado
  if (!link || link.disabled) redirect('/')

  // Link expirado por data
  if (link.expiresAt && new Date() > link.expiresAt) redirect('/')

  // Link expirado por cliques
  if (link.maxClicks) {
    const clickCount = await ClickRepository.countByLinkId(link.id)
    if (clickCount >= link.maxClicks) redirect('/')
  }

  // Link protegido por senha — mostra formulário
  if (link.password) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <PasswordForm slug={slug} />
      </div>
    )
  }

  // Registra o clique
  await ClickRepository.create({
    linkId: link.id,
    referrer: headersList.get('referer') ?? null,
  })

  // Redireciona
  redirect(link.url)
}