import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { LinkRepository, ClickRepository } from '@/lib/repositories'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const headersList = await headers()
  const homeUrl = new URL('/', req.url)

  const link = await LinkRepository.findBySlug(slug)

  if (!link || link.disabled) {
    return NextResponse.redirect(homeUrl)
  }

  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.redirect(homeUrl)
  }

  if (link.maxClicks) {
    const clickCount = await ClickRepository.countByLinkId(link.id)
    if (clickCount >= link.maxClicks) {
      return NextResponse.redirect(homeUrl)
    }
  }

  await ClickRepository.create({
    linkId: link.id,
    referrer: headersList.get('referer') ?? null,
  })

  return NextResponse.redirect(link.url, { status: 302 })
}