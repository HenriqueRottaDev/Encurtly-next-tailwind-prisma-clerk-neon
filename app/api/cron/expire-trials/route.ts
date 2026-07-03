import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const expired = await prisma.user.updateMany({
    where: {
      trialEndsAt: { lte: now },
      plan: { in: ['PRO', 'BASIC'] }, // só rebaixa quem está em trial, não assinantes reais
      stripeSubscriptionId: null, // proteção extra: nunca rebaixa quem tem assinatura ativa
    },
    data: {
      plan: 'FREE',
    },
  })

  return NextResponse.json({ expired: expired.count })
}