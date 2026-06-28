import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { UserRepository, LinkRepository } from '@/lib/repositories'
import { checkLinkLimit } from '@/lib/utils/check-limits'
import { generateUniqueSlug, isValidSlug } from '@/lib/utils/slug'
import bcrypt from 'bcryptjs'

import { isUrlMalicious } from '@/lib/services/safe-browsing'

interface CsvRow {
    url: string
    slug?: string
    title?: string
    password?: string
    expiresAt?: string
    maxClicks?: string
    ctaEnabled?: string
    ctaTitle?: string
    ctaMessage?: string
    ctaButtonText?: string
    ctaButtonUrl?: string
}

interface RowResult {
    row: number
    url: string
    slug?: string
    success: boolean
    error?: string
}

function parseBoolean(value?: string): boolean {
    return value?.toLowerCase() === 'true' || value === '1'
}

export async function POST(req: NextRequest) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await UserRepository.findByClerkId(userId)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.plan === 'FREE') {
        return NextResponse.json(
            { error: 'Upload em massa disponível nos planos Pro e Agência.' },
            { status: 403 }
        )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Arquivo não enviado.' }, { status: 400 })

    const text = await file.text()
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

    if (lines.length < 2) {
        return NextResponse.json({ error: 'CSV vazio ou sem linhas de dados.' }, { status: 400 })
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const urlIndex = headers.indexOf('url')

    const headerMap: Record<string, keyof CsvRow> = {
        url: 'url',
        slug: 'slug',
        title: 'title',
        password: 'password',
        expiresat: 'expiresAt',
        maxclicks: 'maxClicks',
        ctaenabled: 'ctaEnabled',
        ctatitle: 'ctaTitle',
        ctamessage: 'ctaMessage',
        ctabuttontext: 'ctaButtonText',
        ctabuttonurl: 'ctaButtonUrl',
    }

    if (urlIndex === -1) {
        return NextResponse.json({ error: 'Coluna "url" não encontrada no CSV.' }, { status: 400 })
    }

    const dataLines = lines.slice(1)
    const results: RowResult[] = []

    for (let i = 0; i < dataLines.length; i++) {
        const rowNum = i + 2 // +2 porque linha 1 é header
        const values = dataLines[i].split(',').map((v) => v.trim())

        const row: CsvRow = {
            url: values[urlIndex] ?? '',
        }

        headers.forEach((header, idx) => {
            const key = headerMap[header]
            if (key && key !== 'url') {
                (row as unknown as Record<string, string>)[key] = values[idx] ?? ''
            }
        })

        // Validações
        if (!row.url) {
            results.push({ row: rowNum, url: '', success: false, error: 'URL obrigatória.' })
            continue
        }

        try {
            new URL(row.url)
        } catch {
            results.push({ row: rowNum, url: row.url, success: false, error: 'URL inválida.' })
            continue
        }

        const malicious = await isUrlMalicious(row.url)
        if (malicious) {
            results.push({ row: rowNum, url: row.url, success: false, error: 'URL identificada como maliciosa.' })
            continue
        }

        if (row.slug && !isValidSlug(row.slug)) {
            results.push({ row: rowNum, url: row.url, success: false, error: 'Slug inválido.' })
            continue
        }

        if (row.expiresAt && isNaN(Date.parse(row.expiresAt))) {
            results.push({ row: rowNum, url: row.url, success: false, error: 'Data de expiração inválida.' })
            continue
        }

        if (row.maxClicks && isNaN(Number(row.maxClicks))) {
            results.push({ row: rowNum, url: row.url, success: false, error: 'maxClicks deve ser número.' })
            continue
        }

        // Limite de plano
        const limitCheck = await checkLinkLimit(user.id, user.plan)
        if (!limitCheck.allowed) {
            results.push({ row: rowNum, url: row.url, success: false, error: 'Limite de links atingido.' })
            continue
        }

        // Slug único
        let slug: string
        if (row.slug) {
            const existing = await LinkRepository.findBySlug(row.slug)
            if (existing) {
                results.push({ row: rowNum, url: row.url, success: false, error: `Slug "${row.slug}" já existe.` })
                continue
            }
            slug = row.slug
        } else {
            slug = await generateUniqueSlug()
        }

        const hashedPassword = row.password ? await bcrypt.hash(row.password, 10) : undefined

        try {
            const created = await LinkRepository.create(user.id, {
                url: row.url,
                slug,
                title: row.title || null,
                password: hashedPassword || null,
                expiresAt: row.expiresAt ? new Date(row.expiresAt) : null,
                maxClicks: row.maxClicks ? Number(row.maxClicks) : null,
                ctaEnabled: parseBoolean(row.ctaEnabled),
                ctaTitle: row.ctaTitle || null,
                ctaMessage: row.ctaMessage || null,
                ctaButtonText: row.ctaButtonText || null,
                ctaButtonUrl: row.ctaButtonUrl || null,
            })

            results.push({ row: rowNum, url: row.url, slug: created.slug, success: true })
        } catch {
            results.push({ row: rowNum, url: row.url, success: false, error: 'Erro ao salvar no banco.' })
        }
    }

    const succeeded = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    return NextResponse.json({ succeeded, failed, results })
}