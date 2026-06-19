import Stripe from 'stripe'

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
  })
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})