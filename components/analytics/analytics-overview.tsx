import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link2, MousePointerClick, TrendingUp } from 'lucide-react'
import { ClicksChart } from './clicks-chart'

interface TopLink {
  id: string
  slug: string
  title: string | null
  clicks: number
}

interface AnalyticsOverviewProps {
  totalLinks: number
  totalClicks: number
  topLinks: TopLink[]
  clicksByDay: { date: string; count: number }[]
}

export function AnalyticsOverview({
  totalLinks,
  totalClicks,
  topLinks,
  clicksByDay,
}: AnalyticsOverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visão geral do desempenho dos seus links
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalLinks}</p>
              <p className="text-xs text-muted-foreground">Links criados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalClicks}</p>
              <p className="text-xs text-muted-foreground">Cliques totais</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de cliques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Cliques nos últimos 30 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClicksChart data={clicksByDay} />
        </CardContent>
      </Card>

      {/* Top links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Links com mais cliques</CardTitle>
        </CardHeader>
        <CardContent>
          {topLinks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum dado ainda — crie links e compartilhe para ver estatísticas aqui
            </p>
          ) : (
            <div className="space-y-3">
              {topLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between py-2 border-b last:border-0 border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-5">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-primary">
                        /r/{link.slug}
                      </p>
                      {link.title && (
                        <p className="text-xs text-muted-foreground">{link.title}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {link.clicks} {link.clicks === 1 ? 'clique' : 'cliques'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}