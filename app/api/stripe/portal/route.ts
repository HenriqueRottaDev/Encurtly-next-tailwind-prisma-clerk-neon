import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { UserRepository } from '@/lib/repositories'

export async function POST() {
  const { userId } = await auth()
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