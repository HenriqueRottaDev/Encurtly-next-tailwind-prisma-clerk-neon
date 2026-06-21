import { POST } from '@/app/api/stripe/webhook/route'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock do Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
    customers: {
      retrieve: jest.fn(),
    },
  },
}))

// Mock do next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() =>
    Promise.resolve({
      get: jest.fn(() => 'fake-signature'),
    })
  ),
}))

function createWebhookRequest(body: object) {
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const mockUser = {
  id: 'user_123',
  clerkId: 'clerk_123',
  email: 'teste@encurtly.com',
  name: 'Usuário Teste',
  plan: 'FREE',
  stripeCustomerId: 'cus_456',
  stripeSubscriptionId: null,
  stripeCurrentPeriodEnd: null,
  stripeCancelAtPeriodEnd: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Subscription mock seguindo a estrutura real (current_period_end dentro de items.data[0])
function makeSubscriptionMock(overrides = {}) {
  return {
    id: 'sub_789',
    customer: 'cus_456',
    status: 'active',
    cancel_at_period_end: false,
    cancel_at: null,
    items: {
      data: [
        {
          current_period_end: 1784572675, // timestamp fixo para teste
        },
      ],
    },
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/stripe/webhook', () => {
  it('retorna 400 quando a assinatura do webhook é inválida', async () => {
    ;(stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Assinatura inválida')
    })

    const req = createWebhookRequest({})
    const res = await POST(req)

    expect(res.status).toBe(400)
  })

  describe('checkout.session.completed', () => {
    it('ativa o plano do usuário após checkout bem-sucedido', async () => {
      const subscriptionMock = makeSubscriptionMock()

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            subscription: 'sub_789',
            metadata: { clerkId: 'clerk_123', plan: 'PRO' },
          },
        },
      })
      ;(stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(subscriptionMock)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clerkId: 'clerk_123' },
          data: expect.objectContaining({
            stripeSubscriptionId: 'sub_789',
            plan: 'PRO',
            stripeCurrentPeriodEnd: new Date(1784572675 * 1000),
          }),
        })
      )
    })

    it('retorna 400 quando faltam metadados (clerkId ou plan)', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            subscription: 'sub_789',
            metadata: {},
          },
        },
      })
      ;(stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(makeSubscriptionMock())

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(400)
    })
  })

  describe('invoice.payment_succeeded', () => {
    it('atualiza o período de renovação da assinatura', async () => {
      const subscriptionMock = makeSubscriptionMock()

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            subscription: 'sub_789',
          },
        },
      })
      ;(stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(subscriptionMock)
      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_456' })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stripeCurrentPeriodEnd: new Date(1784572675 * 1000),
          }),
        })
      )
    })

    it('busca a subscription via parent.subscription_details quando subscription não está no nível raiz', async () => {
      const subscriptionMock = makeSubscriptionMock()

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            parent: {
              subscription_details: { subscription: 'sub_789' },
            },
          },
        },
      })
      ;(stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(subscriptionMock)
      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_456' })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(stripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_789')
    })

    it('retorna 404 quando o usuário não é encontrado pelo customerId', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'invoice.payment_succeeded',
        data: { object: { subscription: 'sub_789' } },
      })
      ;(stripe.subscriptions.retrieve as jest.Mock).mockResolvedValue(makeSubscriptionMock())
      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_456' })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(404)
    })
  })

  describe('customer.subscription.updated / deleted', () => {
    it('rebaixa o usuário para FREE quando a assinatura é cancelada (status canceled)', async () => {
      const subscriptionMock = makeSubscriptionMock({ status: 'canceled' })

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: subscriptionMock },
      })
      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_456' })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            plan: 'FREE',
            stripeSubscriptionId: null,
            stripeCurrentPeriodEnd: null,
            stripeCancelAtPeriodEnd: false,
          }),
        })
      )
    })

    it('rebaixa para FREE quando a assinatura está inadimplente (status unpaid)', async () => {
      const subscriptionMock = makeSubscriptionMock({ status: 'unpaid' })

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: subscriptionMock },
      })
      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_456' })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ plan: 'FREE' }) })
      )
    })

    it('marca stripeCancelAtPeriodEnd=true quando "cancel_at" está presente (mesmo com cancel_at_period_end=false)', async () => {
      const subscriptionMock = makeSubscriptionMock({
        status: 'active',
        cancel_at_period_end: false,
        cancel_at: 1784572675,
      })

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: subscriptionMock },
      })
      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_456' })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ stripeCancelAtPeriodEnd: true }),
        })
      )
    })

    it('mantém stripeCancelAtPeriodEnd=false quando não há cancelamento agendado', async () => {
      const subscriptionMock = makeSubscriptionMock({
        status: 'active',
        cancel_at_period_end: false,
        cancel_at: null,
      })

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: subscriptionMock },
      })
      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_456' })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(200)
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ stripeCancelAtPeriodEnd: false }),
        })
      )
    })

    it('retorna 404 quando o usuário não é encontrado', async () => {
      const subscriptionMock = makeSubscriptionMock()

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: 'customer.subscription.updated',
        data: { object: subscriptionMock },
      })
      ;(stripe.customers.retrieve as jest.Mock).mockResolvedValue({ id: 'cus_456' })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const req = createWebhookRequest({})
      const res = await POST(req)

      expect(res.status).toBe(404)
    })
  })
})