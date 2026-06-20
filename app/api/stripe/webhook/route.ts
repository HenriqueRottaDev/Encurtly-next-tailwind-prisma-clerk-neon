import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { UserRepository } from '@/lib/repositories'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return new Response('Webhook inválido', { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Checkout concluído — atualiza o plano
  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )

    const clerkId = session.metadata?.clerkId
    const plan = session.metadata?.plan as 'PRO' | 'AGENCY'

    if (!clerkId || !plan) return new Response('Metadata ausente', { status: 400 })

    // Na versão dahlia, o período atual fica em billing_cycle_anchor
    const periodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : null

    await UserRepository.updateStripeInfo(clerkId, {
      stripeSubscriptionId: subscription.id,
      ...(periodEnd && { stripeCurrentPeriodEnd: periodEnd }),
      plan,
    })
  }

  // Renovação da assinatura
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice

    // Na versão dahlia, subscription ficou em parent
    const subscriptionId = (invoice as any).subscription as string ??
      (invoice.parent as any)?.subscription_details?.subscription as string

    if (!subscriptionId) return new Response('Subscription não encontrada', { status: 400 })
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    ) as Stripe.Customer

    const user = await UserRepository.findByStripeCustomerId(customer.id)
    if (!user) return new Response('Usuário não encontrado', { status: 404 })

    const periodEnd = (subscription as any).current_period_end
      ? new Date((subscription as any).current_period_end * 1000)
      : null

    await UserRepository.updateStripeInfo(user.clerkId, {
      ...(periodEnd && { stripeCurrentPeriodEnd: periodEnd }),
    })
  }

  // Assinatura cancelada ou expirada
  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer

    const user = await UserRepository.findByStripeCustomerId(customer.id)
    if (!user) return new Response('Usuário não encontrado', { status: 404 })

    // Se cancelou ou está inadimplente, volta para FREE
    if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      await UserRepository.updateStripeInfo(user.clerkId, {
        plan: 'FREE',
        stripeSubscriptionId: undefined,
        stripeCurrentPeriodEnd: undefined,
        stripeCancelAtPeriodEnd: false,
      })
    } else {
      // Atualiza o status de cancelamento agendado (sem mudar o plano ainda)
      await UserRepository.updateStripeInfo(user.clerkId, {
        stripeCancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
      })
    }
  }

  return NextResponse.json({ received: true })
}