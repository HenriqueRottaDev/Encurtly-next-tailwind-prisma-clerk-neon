import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { generateUniqueSlug, isValidSlug } from '@/lib/utils/slug'
import { z } from 'zod'
import { checkLinkLimit } from '@/lib/utils/check-limits'
import bcrypt from 'bcryptjs'

import { WorkspaceLogRepository } from '@/lib/repositories/workspace-log.repository'

import { isUrlMalicious } from '@/lib/services/safe-browsing'

const createLinkSchema = z.object({
  url: z.string().url('URL inválida — certifique-se de incluir http:// ou https://'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').max(50, 'Slug deve ter no máximo 50 caracteres').optional(),
  title: z.string().max(100, 'Título deve ter no máximo 100 caracteres').optional(),
  password: z.string().optional(),
  expiresAt: z.string().datetime('Data de expiração inválida').optional(),
  maxClicks: z.number().int().positive('Máximo de cliques deve ser um número positivo').optional(),
  ctaEnabled: z.boolean().optional(),
  ctaTitle: z.string().max(100).optional(),
  ctaMessage: z.string().max(300).optional(),
  ctaButtonText: z.string().max(50).optional(),
  ctaButtonUrl: z.string().url('URL do botão inválida').optional(),
  workspaceId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sp = req.nextUrl.searchParams
  const page = Math.max(1, Number(sp.get('page') ?? '1'))
  const perPage = [10, 50, 100].includes(Number(sp.get('perPage')))
    ? Number(sp.get('perPage'))
    : 10

  const result = await LinkRepository.findByUserIdPaginated(user.id, page, perPage)
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const limitCheck = await checkLinkLimit(user.id, user.plan)
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: limitCheck.reason, upgradeRequired: true },
      { status: 403 }
    )
  }

  const body = await req.json()
  const parsed = createLinkSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const malicious = await isUrlMalicious(parsed.data.url)
  if (malicious) {
    return NextResponse.json(
      { error: 'Esta URL foi identificada como maliciosa e não pode ser encurtada.' },
      { status: 422 }
    )
  }

  const { url, slug, title, password, expiresAt, maxClicks, ctaEnabled, ctaTitle, ctaMessage, ctaButtonText, ctaButtonUrl, workspaceId } = parsed.data


  if (slug) {
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: 'Slug inválido' }, { status: 400 })
    }
    const existing = await LinkRepository.findBySlug(slug)
    if (existing) {
      return NextResponse.json({ error: 'Slug já em uso' }, { status: 409 })
    }
  }

  const finalSlug = slug ?? await generateUniqueSlug()

  // Hash da senha antes de salvar (nunca armazenar texto puro)
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null

  const link = await LinkRepository.create(user.id, {
    url,
    slug: finalSlug,
    title,
    password: hashedPassword,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    maxClicks,
    ctaEnabled: ctaEnabled ?? false,
    ctaTitle,
    ctaMessage,
    ctaButtonText,
    ctaButtonUrl,
    workspaceId: workspaceId ?? null,
  })

  if (workspaceId) {
    await WorkspaceLogRepository.create({
      workspaceId,
      userId: user.id,
      action: 'link.created',
      description: `Criou o link /${link.slug}${title ? ` — "${title}"` : ''}`,
    })
  }

  return NextResponse.json(link, { status: 201 })
}