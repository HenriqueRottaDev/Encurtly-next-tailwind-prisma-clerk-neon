import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PLANS, PlanType } from '@/lib/plans'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface PlanUsageProps {
  plan: PlanType
  linksUsed: number
  clicksUsed: number
  cancelAtPeriodEnd?: boolean
  currentPeriodEnd?: Date | null
}

export function PlanUsage({
  plan,
  linksUsed,
  clicksUsed,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: PlanUsageProps) {
  const planConfig = PLANS[plan]
  const linksPercent = planConfig.maxLinks === Infinity
    ? 0
    : Math.min((linksUsed / planConfig.maxLinks) * 100, 100)
  const clicksPercent = Math.min((clicksUsed / planConfig.maxClicks) * 100, 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Plano {planConfig.name}</CardTitle>
          {plan === 'FREE' && (
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
            <span>
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
            <span>{clicksUsed} / {planConfig.maxClicks}</span>
          </div>
          <Progress value={clicksPercent} />
        </div>
      </CardContent>
    </Card>
  )
}