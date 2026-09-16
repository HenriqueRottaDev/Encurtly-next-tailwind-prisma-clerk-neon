import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PLANS } from '@/lib/plans'
import { sendUsageAlertEmail } from '@/lib/services/email'

const ALERT_THRESHOLD = 0.8
const RESEND_COOLDOWN_DAYS = 7 // não manda de novo antes de 7 dias

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const cooldownDate = new Date()
  cooldownDate.setDate(cooldownDate.getDate() - RESEND_COOLDOWN_DAYS)

  // Só usuários com plano pago ativo (Básico, Pro, Agência)
  const users = await prisma.user.findMany({
    where: {
      plan: { in: ['BASIC', 'PRO', 'AGENCY'] },
      OR: [
        { lastUsageAlertSentAt: null },
        { lastUsageAlertSentAt: { lt: cooldownDate } },
      ],
    },
    select: { id: true, clerkId: true, email: true, name: true, plan: true },
  })

  let sentCount = 0

  for (const user of users) {
    const planConfig = PLANS[user.plan]

    const linksCount = await prisma.link.count({ where: { userId: user.id } })
    const clicksCount = await prisma.click.count({
      where: {
        link: { userId: user.id },
        createdAt: { gte: startOfMonth },
      },
    })

    const linksPercent = planConfig.maxLinks === Infinity
      ? 0
      : linksCount / planConfig.maxLinks
    const clicksPercent = clicksCount / planConfig.maxClicks

    const isNearLimit = linksPercent >= ALERT_THRESHOLD || clicksPercent >= ALERT_THRESHOLD

    if (isNearLimit) {
      try {
        await sendUsageAlertEmail({
          to: user.email,
          name: user.name,
          planName: planConfig.name,
          linksUsed: linksCount,
          linksLimit: planConfig.maxLinks === Infinity ? null : planConfig.maxLinks,
          clicksUsed: clicksCount,
          clicksLimit: planConfig.maxClicks,
        })

        await prisma.user.update({
          where: { id: user.id },
          data: { lastUsageAlertSentAt: new Date() },
        })

        sentCount++
      } catch (err) {
        console.error(`Falha ao enviar alerta para ${user.email}:`, err)
      }
    }
  }

  return NextResponse.json({ checked: users.length, sent: sentCount })
}