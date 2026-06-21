import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Tentativas de senha: 5 tentativas a cada 1 minuto, por link + IP
export const verifyPasswordLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'ratelimit:verify-password',
})

// Checkout/portal do Stripe: 10 requisições por minuto, por usuário
export const stripeActionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:stripe-action',
})

// Cliques em redirecionamento: 30 por minuto, por IP (evita flood automatizado)
export const redirectLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  prefix: 'ratelimit:redirect',
})