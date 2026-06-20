import { prisma } from '@/lib/prisma'
import { PLANS, PlanType } from '@/lib/plans'

interface LimitCheckResult {
  allowed: boolean
  reason?: string
  currentCount?: number
  limit?: number
}

export async function checkLinkLimit(userId: string, plan: PlanType): Promise<LimitCheckResult> {
  const planConfig = PLANS[plan]

  if (planConfig.maxLinks === Infinity) {
    return { allowed: true }
  }

  const linkCount = await prisma.link.count({
    where: { userId },
  })

  if (linkCount >= planConfig.maxLinks) {
    return {
      allowed: false,
      reason: `Você atingiu o limite de ${planConfig.maxLinks} links do plano ${planConfig.name}. Faça upgrade para criar mais.`,
      currentCount: linkCount,
      limit: planConfig.maxLinks,
    }
  }

  return { allowed: true, currentCount: linkCount, limit: planConfig.maxLinks }
}

export async function checkClickLimit(userId: string, plan: PlanType): Promise<LimitCheckResult> {
  const planConfig = PLANS[plan]

  // Conta cliques do mês atual em todos os links do usuário
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const userLinks = await prisma.link.findMany({
    where: { userId },
    select: { id: true },
  })
  const linkIds = userLinks.map(l => l.id)

  const clickCount = linkIds.length > 0
    ? await prisma.click.count({
        where: {
          linkId: { in: linkIds },
          createdAt: { gte: startOfMonth },
        },
      })
    : 0

  if (clickCount >= planConfig.maxClicks) {
    return {
      allowed: false,
      reason: `Você atingiu o limite de ${planConfig.maxClicks} cliques rastreados este mês no plano ${planConfig.name}.`,
      currentCount: clickCount,
      limit: planConfig.maxClicks,
    }
  }

  return { allowed: true, currentCount: clickCount, limit: planConfig.maxClicks }
}