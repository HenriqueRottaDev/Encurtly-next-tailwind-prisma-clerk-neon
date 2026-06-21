import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { UserRepository } from '@/lib/repositories'
import { PLANS } from '@/lib/plans'
import { z } from 'zod'
import { stripeActionLimiter } from '@/lib/rate-limit'

const checkoutSchema = z.object({
  plan: z.enum(['PRO', 'AGENCY']),
})

export async function POST(req: Request) {
  const { userId } = await auth()
  const { success } = await stripeActionLimiter.limit(userId as string)
  if (!success) {
    return NextResponse.json(
      { error: 'Muitas requisições. Aguarde um instante.' },
      { status: 429 }
    )
  }
  if (!userId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await UserRepository.findByClerkId(userId)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const body = await req.json()
  const { plan } = checkoutSchema.parse(body)

  const planConfig = PLANS[plan]
  if (!planConfig.stripePriceId) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  // Cria ou recupera o customer no Stripe
  let stripeCustomerId = user.stripeCustomerId

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { clerkId: userId },
    })
    stripeCustomerId = customer.id
    await UserRepository.updateStripeInfo(userId, { stripeCustomerId })
  }

  // Cria a sessão de checkout
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planConfig.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    metadata: {
      clerkId: userId,
      plan,
    },
    subscription_data: {
      metadata: {
        clerkId: userId,
        plan,
      },
    },
    allow_promotion_codes: true,
    locale: 'pt-BR',
  })

  return NextResponse.json({ url: session.url })
}