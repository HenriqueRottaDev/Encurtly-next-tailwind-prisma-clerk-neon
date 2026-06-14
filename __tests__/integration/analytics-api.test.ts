import { GET as getLinkAnalytics } from '@/app/api/links/[id]/analytics/route'
import { GET as getOverview } from '@/app/api/analytics/overview/route'
import { prisma } from '@/lib/prisma'
import { createRequest } from '../helpers/request'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        link: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
        },
        click: {
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        $queryRaw: jest.fn(),
    },
}))

// Mock do Clerk
jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}))

import { auth } from '@clerk/nextjs/server'

const mockUser = {
    id: 'user_123',
    clerkId: 'clerk_123',
    email: 'teste@encurtly.com',
    name: 'Usuário Teste',
    plan: 'FREE',
    createdAt: new Date(),
    updatedAt: new Date(),
}

const mockLink = {
    id: 'link_123',
    slug: 'meu-link',
    url: 'https://google.com',
    title: 'Google',
    description: null,
    password: null,
    expiresAt: null,
    maxClicks: null,
    disabled: false,
    userId: 'user_123',
    workspaceId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { clicks: 5 },
}

beforeEach(() => {
    jest.clearAllMocks()
})

// ─── GET /api/links/[id]/analytics ─────────────────────

describe('GET /api/links/[id]/analytics', () => {
    it('retorna 401 quando não está autenticado', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: null })

        const req = createRequest('http://localhost:3000/api/links/link_123/analytics')
        const res = await getLinkAnalytics(req, { params: Promise.resolve({ id: 'link_123' }) })

        expect(res.status).toBe(401)
    })

    it('retorna 404 quando o link não pertence ao usuário', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.link.findUnique as jest.Mock).mockResolvedValue({
                ...mockLink,
                userId: 'outro_usuario',
            })

        const req = createRequest('http://localhost:3000/api/links/link_123/analytics')
        const res = await getLinkAnalytics(req, { params: Promise.resolve({ id: 'link_123' }) })

        expect(res.status).toBe(404)
    })

    it('retorna analytics agregados do link', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.link.findUnique as jest.Mock).mockResolvedValue(mockLink)
            ; (prisma.click.count as jest.Mock).mockResolvedValue(5)
            ; (prisma.$queryRaw as jest.Mock).mockResolvedValue([
                { date: new Date('2026-06-14'), count: BigInt(5) },
            ])
            ; (prisma.click.groupBy as jest.Mock).mockResolvedValue([
                { country: 'BR', _count: { _all: 5 } },
            ])

        const req = createRequest('http://localhost:3000/api/links/link_123/analytics')
        const res = await getLinkAnalytics(req, { params: Promise.resolve({ id: 'link_123' }) })

        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.totalClicks).toBe(5)
        expect(body.clicksByDay).toEqual([{ date: '2026-06-14', count: 5 }])
        expect(body.byCountry).toEqual([{ label: 'BR', count: 5 }])
    })

    it('usa 30 dias como padrão quando "days" é inválido', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.link.findUnique as jest.Mock).mockResolvedValue(mockLink)
            ; (prisma.click.count as jest.Mock).mockResolvedValue(0)
            ; (prisma.$queryRaw as jest.Mock).mockResolvedValue([])
            ; (prisma.click.groupBy as jest.Mock).mockResolvedValue([])

        const req = createRequest('http://localhost:3000/api/links/link_123/analytics?days=99999')
        const res = await getLinkAnalytics(req, { params: Promise.resolve({ id: 'link_123' }) })

        expect(res.status).toBe(200)
        // Verifica que a query SQL foi chamada (com o fallback de 30 dias)
        expect(prisma.$queryRaw).toHaveBeenCalled()
    })
})

// ─── GET /api/analytics/overview ───────────────────────

describe('GET /api/analytics/overview', () => {
    it('retorna 401 quando não está autenticado', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: null })

        const res = await getOverview()

        expect(res.status).toBe(401)
    })

    it('retorna overview com totais e top links', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.link.findMany as jest.Mock).mockResolvedValue([mockLink])
            ; (prisma.click.count as jest.Mock).mockResolvedValue(5)
            ; (prisma.$queryRaw as jest.Mock).mockResolvedValue([
                { date: new Date('2026-06-14'), count: BigInt(5) },
            ])

        const res = await getOverview()

        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.totalLinks).toBe(1)
        expect(body.totalClicks).toBe(5)
        expect(body.topLinks[0].slug).toBe('meu-link')
        expect(body.clicksByDay).toEqual([{ date: '2026-06-14', count: 5 }])
    })

    it('retorna zero cliques quando o usuário não tem links', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
            ; (prisma.link.findMany as jest.Mock).mockResolvedValue([])
            ; (prisma.click.count as jest.Mock).mockResolvedValue(0)
            ; (prisma.$queryRaw as jest.Mock).mockResolvedValue([])

        const res = await getOverview()

        expect(res.status).toBe(200)
        const body = await res.json()
        expect(body.totalLinks).toBe(0)
        expect(body.totalClicks).toBe(0)
        expect(body.topLinks).toEqual([])
        expect(body.clicksByDay).toEqual([])
    })
})