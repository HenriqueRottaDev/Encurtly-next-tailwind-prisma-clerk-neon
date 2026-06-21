import { POST } from '@/app/api/stripe/portal/route'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
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
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

import { auth } from '@clerk/nextjs/server'

const mockUserWithSubscription = {
  id: 'user_123',
  clerkId: 'clerk_123',
  email: 'teste@encurtly.com',
  name: 'Usuário Teste',
  plan: 'PRO',
  stripeCustomerId: 'cus_existente456',
  stripeSubscriptionId: 'sub_123',
  stripeCurrentPeriodEnd: new Date(),
  stripeCancelAtPeriodEnd: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/stripe/portal', () => {
  it('retorna 401 quando não está autenticado', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: null })

    const res = await POST()

    expect(res.status).toBe(401)
  })

  it('retorna 400 quando o usuário não tem stripeCustomerId (sem assinatura)', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUserWithSubscription,
      stripeCustomerId: null,
    })

    const res = await POST()

    expect(res.status).toBe(400)
  })

  it('retorna 400 quando o usuário não existe no banco', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await POST()

    expect(res.status).toBe(400)
  })

  it('cria uma sessão do portal e retorna a URL', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithSubscription)
    ;(stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue({
      url: 'https://billing.stripe.com/session/portal123',
    })

    const res = await POST()

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://billing.stripe.com/session/portal123')
  })

  it('chama o Stripe com o customer correto', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_123' })
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUserWithSubscription)
    ;(stripe.billingPortal.sessions.create as jest.Mock).mockResolvedValue({
      url: 'https://billing.stripe.com/session/portal456',
    })

    await POST()

    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existente456' })
    )
  })
})