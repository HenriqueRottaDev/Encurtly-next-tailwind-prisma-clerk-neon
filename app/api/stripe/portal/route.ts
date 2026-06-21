import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { UserRepository } from '@/lib/repositories'
import { stripeActionLimiter } from '@/lib/rate-limit'

export async function POST() {
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
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'Sem assinatura ativa' }, { status: 400 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}