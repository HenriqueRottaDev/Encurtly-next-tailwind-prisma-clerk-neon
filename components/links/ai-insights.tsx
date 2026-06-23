'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Lock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AiInsightsProps {
  linkId: string
  days: number
  isPro: boolean
}

interface InsightData {
  summary: string
  insights: string[]
  suggestions: string[]
  generatedAt: string
  cached: boolean
}

export function AiInsights({ linkId, days, isPro }: AiInsightsProps) {
  const [data, setData] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function generate(forceRefresh = false) {
    setLoading(true)
    setError(null)
    setOpen(true)
    try {
      const res = await fetch(
        `/api/links/${linkId}/ai-insights?days=${days}${forceRefresh ? '&refresh=1' : ''}`
      )
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erro ao gerar insights.'); return }
      setData(json)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isPro) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Insights com IA disponíveis nos planos{' '}
          <span className="font-medium text-foreground">Pro</span> e{' '}
          <span className="font-medium text-foreground">Agência</span>.
        </p>
        <Button variant="outline" size="sm" className="ml-auto shrink-0" asChild>
          <a href="/pricing">Ver planos</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!data && !loading && (
          <Button variant="outline" size="sm" onClick={() => generate()} className="gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Gerar insights com IA
          </Button>
        )}

        {loading && (
          <Button variant="outline" size="sm" disabled className="gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analisando dados...
          </Button>
        )}

        {data && !loading && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} className="gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Insights com IA
              {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            {data.cached && <Badge variant="secondary" className="text-xs font-normal">cache 24h</Badge>}
            <span className="text-xs text-muted-foreground">
              {new Date(data.generatedAt).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
              })}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => generate(true)} title="Regenerar">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {data && open && (
        <Card className={cn('border-violet-200 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/20')}>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Análise — últimos {days} dias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-4">
            <p className="text-sm leading-relaxed">{data.summary}</p>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Principais observações
              </p>
              <ul className="space-y-1.5">
                {data.insights.map((insight, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-violet-500/15 text-center text-[10px] font-bold leading-4 text-violet-600 dark:text-violet-400">
                      {i + 1}
                    </span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sugestões
              </p>
              <ul className="space-y-1.5">
                {data.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 text-violet-500">→</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}