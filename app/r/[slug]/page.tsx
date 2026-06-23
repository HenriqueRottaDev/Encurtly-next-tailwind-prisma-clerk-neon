import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { LinkRepository, ClickRepository, UserRepository } from '@/lib/repositories'
import { RedirectRuleRepository } from '@/lib/repositories/redirect-rule.repository'
import { extractClickInfo } from '@/lib/utils/click-info'
import { resolveRedirectUrl } from '@/lib/utils/redirect-rules'
import { PasswordForm } from '@/components/links/password-form'
import { CtaOverlay } from '@/components/links/cta-overlay'
import { checkClickLimit } from '@/lib/utils/check-limits'
import { redirectLimiter } from '@/lib/rate-limit'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function LinkPage({ params }: PageProps) {
  const { slug } = await params

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const { success } = await redirectLimiter.limit(ip)

  if (!success) redirect('/')

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

  const owner = await UserRepository.findById(link.userId)

  if (owner?.plan === 'FREE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CtaOverlay
          slug={slug}
          ctaEnabled={link.ctaEnabled}
          ctaTitle={link.ctaTitle}
          ctaMessage={link.ctaMessage}
          ctaButtonText={link.ctaButtonText}
          ctaButtonUrl={link.ctaButtonUrl}
        />
      </div>
    )
  }

  // Plano Pro/Agência — resolve redirect condicional
  const clickInfo = await extractClickInfo(`https://encurtly.com.br/r/${slug}`)

  const rules = await RedirectRuleRepository.findByLinkId(link.id)

  let finalUrl = link.url

  if (rules.length > 0) {
    const now = new Date()
    const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`

    const resolvedUrl = resolveRedirectUrl(rules, {
      country: headersList.get('x-vercel-ip-country'),
      device: clickInfo.device ?? null,
      currentTime,
    })

    if (resolvedUrl) finalUrl = resolvedUrl
  }

  if (owner) {
    const clickLimitCheck = await checkClickLimit(owner.id, owner.plan)
    if (clickLimitCheck.allowed) {
      await ClickRepository.create({
        linkId: link.id,
        ...clickInfo,
      })
    }
  }

  redirect(finalUrl)
}