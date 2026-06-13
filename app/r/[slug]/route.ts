import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const headersList = await headers()

  const link = await prisma.link.findUnique({ where: { slug } })

  // Link não encontrado
  if (!link) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Link desativado
  if (link.disabled) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Link expirado por data
  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Link expirado por cliques
  if (link.maxClicks) {
    const clickCount = await prisma.click.count({ where: { linkId: link.id } })
    if (clickCount >= link.maxClicks) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Registra o clique
  const userAgent = headersList.get('user-agent') ?? ''
  const referrer = headersList.get('referer') ?? null
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ?? null

  await prisma.click.create({
    data: {
      linkId: link.id,
      referrer,
      // País e cidade virão na Fase 2 com geolocalização por IP
    },
  })

  return NextResponse.redirect(link.url, { status: 302 })
}