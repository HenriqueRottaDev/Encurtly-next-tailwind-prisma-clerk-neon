import { POST } from '@/app/api/stripe/checkout/route'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { createRequest } from '../helpers/request'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}))

// Mock do Clerk
jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn(),
}))

// Mock do Stripe
jest.mock('@/lib/stripe', () => ({
    stripe: {
        customers: {
            create: jest.fn(),
        },
        checkout: {
            sessions: {
                create: jest.fn(),
            },
        },
    },
}))

jest.mock('@/lib/plans', () => ({
    PLANS: {
        FREE: { name: 'Free', maxLinks: 50, maxClicks: 1000, features: [] },
        PRO: {
            name: 'Pro',
            maxLinks: Infinity,
            maxClicks: 25000,
            stripePriceId: 'price_pro_test123',
            features: [],
        },
        AGENCY: {
            name: 'Agência',
            maxLinks: Infinity,
            maxClicks: 100000,
            stripePriceId: 'price_agency_test123',
            features: [],
        },
    },
}))

import { auth } from '@clerk/nextjs/server'

const mockUser = {
    id: 'user_123',
    clerkId: 'clerk_123',
    email: 'teste@encurtly.com',
    name: 'Usuário Teste',
    plan: 'FREE',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripeCurrentPeriodEnd: null,
    stripeCancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date(),
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('POST /api/stripe/checkout', () => {
    it('retorna 401 quando não está autenticado', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: null })

        const req = createRequest('http://localhost:3000/api/stripe/checkout', {
            method: 'POST',
            body: JSON.stringify({ plan: 'PRO' }),
        })
        const res = await POST(req)

        expect(res.status).toBe(401)
    })

    it('retorna 404 quando o usuário não existe no banco', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

        const req = createRequest('http://localhost:3000/api/stripe/checkout', {
            method: 'POST',
            body: JSON.stringify({ plan: 'PRO' }),
        })
        const res = await POST(req)

        expect(res.status).toBe(404)
    })

    it('cria um novo customer no Stripe quando o usuário ainda não tem um', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
            ; (stripe.customers.create as jest.Mock).mockResolvedValue({ id: 'cus_novo123' })
            ; (prisma.user.update as jest.Mock).mockResolvedValue({})
            ; (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
                url: 'https://checkout.stripe.com/session123',
            })

        const req = createRequest('http://localhost:3000/api/stripe/checkout', {
            method: 'POST',
            body: JSON.stringify({ plan: 'PRO' }),
        })
        const res = await POST(req)

        expect(res.status).toBe(200)
        expect(stripe.customers.create).toHaveBeenCalledWith(
            expect.objectContaining({ email: mockUser.email })
        )
        const body = await res.json()
        expect(body.url).toBe('https://checkout.stripe.com/session123')
    })

    it('reutiliza o customer existente quando o usuário já tem stripeCustomerId', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser,
                stripeCustomerId: 'cus_existente456',
            })
            ; (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
                url: 'https://checkout.stripe.com/session456',
            })

        const req = createRequest('http://localhost:3000/api/stripe/checkout', {
            method: 'POST',
            body: JSON.stringify({ plan: 'PRO' }),
        })
        const res = await POST(req)

        expect(res.status).toBe(200)
        expect(stripe.customers.create).not.toHaveBeenCalled()
        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({ customer: 'cus_existente456' })
        )
    })

    it('retorna 400 quando o plano enviado é inválido', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

        const req = createRequest('http://localhost:3000/api/stripe/checkout', {
            method: 'POST',
            body: JSON.stringify({ plan: 'ENTERPRISE' }),
        })

        await expect(POST(req)).rejects.toThrow()
    })

    it('inclui metadata correta na sessão de checkout (clerkId e plan)', async () => {
        ; (auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
            ; (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser,
                stripeCustomerId: 'cus_existente456',
            })
            ; (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
                url: 'https://checkout.stripe.com/session789',
            })

        const req = createRequest('http://localhost:3000/api/stripe/checkout', {
            method: 'POST',
            body: JSON.stringify({ plan: 'AGENCY' }),
        })
        await POST(req)

        expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
            expect.objectContaining({
                metadata: expect.objectContaining({ clerkId: 'clerk_123', plan: 'AGENCY' }),
            })
        )
    })
})