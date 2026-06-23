import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MousePointerClick, Globe, Smartphone, Compass, ExternalLink } from 'lucide-react'
import { ClicksChart } from './clicks-chart'
import { BreakdownChart } from './breakdown-chart'
import type { LinkAnalytics } from '@/lib/repositories/click.repository'
import { AiInsights } from '../links/ai-insights'

import { RedirectRules } from '@/components/links/redirect-rules'

interface LinkAnalyticsViewProps {
  link: {
    id: string
    slug: string
    title: string | null
    url: string
    disabled: boolean
  }
  analytics: LinkAnalytics
  isPro: boolean
}

export function LinkAnalyticsView({ link, analytics, isPro }: LinkAnalyticsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Links
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            /r/{link.slug}
          </h1>
          {link.disabled && <Badge variant="destructive" className="text-xs">Pausado</Badge>}
        </div>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-1"
        >
          {link.title || link.url}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Total de cliques */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MousePointerClick className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{analytics.totalClicks}</p>
            <p className="text-xs text-muted-foreground">Cliques totais</p>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de cliques ao longo do tempo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cliques nos últimos 30 dias</CardTitle>
        </CardHeader>
        <CardContent>
          <ClicksChart data={analytics.clicksByDay} />
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AiInsights linkId={link.id} days={30} isPro={isPro} />

      <RedirectRules linkId={link.id} isPro={isPro} />

      {/* Grid de breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Países
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={analytics.byCountry} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={analytics.byDevice} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Navegadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={analytics.byBrowser} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Sistemas Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownChart data={analytics.byOs} />
          </CardContent>
        </Card>
      </div>

      {/* Referrer - linha completa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Origem do tráfego (Referrer)</CardTitle>
        </CardHeader>
        <CardContent>
          <BreakdownChart data={analytics.byReferrer} />
        </CardContent>
      </Card>
    </div>
  )
}