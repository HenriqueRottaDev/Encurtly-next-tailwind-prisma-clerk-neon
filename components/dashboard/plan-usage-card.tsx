'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PLANS, PlanType } from '@/lib/plans'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface PlanUsageCardProps {
  plan: PlanType
  linksUsed: number
  clicksUsed: number
  cancelAtPeriodEnd?: boolean
  currentPeriodEnd?: Date | null
}

const ALERT_THRESHOLD = 80

export function PlanUsageCard({
  plan,
  linksUsed,
  clicksUsed,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: PlanUsageCardProps) {
  const planConfig = PLANS[plan]
  const linksPercent = planConfig.maxLinks === Infinity
    ? 0
    : Math.min((linksUsed / planConfig.maxLinks) * 100, 100)
  const clicksPercent = Math.min((clicksUsed / planConfig.maxClicks) * 100, 100)

  const isNearLimit = linksPercent >= ALERT_THRESHOLD || clicksPercent >= ALERT_THRESHOLD

  return (
    <Card className={isNearLimit ? 'border-orange-500/40' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Plano {planConfig.name}</CardTitle>
            {isNearLimit && (
              <span className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Perto do limite
              </span>
            )}
          </div>
          {plan !== 'AGENCY' && (
            <Button size="sm" variant="outline" asChild>
              <Link href="/pricing">Fazer upgrade</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {cancelAtPeriodEnd && currentPeriodEnd && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 text-sm text-orange-600 dark:text-orange-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Sua assinatura {planConfig.name} está ativa até{' '}
              {currentPeriodEnd.toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Links</span>
            <span className={linksPercent >= ALERT_THRESHOLD ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
              {linksUsed} / {planConfig.maxLinks === Infinity ? '∞' : planConfig.maxLinks}
            </span>
          </div>
          {planConfig.maxLinks !== Infinity && (
            <Progress value={linksPercent} />
          )}
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Cliques este mês</span>
            <span className={clicksPercent >= ALERT_THRESHOLD ? 'text-orange-600 dark:text-orange-400 font-medium' : ''}>
              {clicksUsed} / {planConfig.maxClicks}
            </span>
          </div>
          <Progress value={clicksPercent} />
        </div>
      </CardContent>
    </Card>
  )
}