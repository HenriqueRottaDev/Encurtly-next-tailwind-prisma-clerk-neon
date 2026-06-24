'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Lock, Globe, Smartphone, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { FieldTooltip } from '@/components/ui/field-tooltip'

interface RedirectRule {
  id: string
  type: 'country' | 'device' | 'time'
  condition: string
  url: string
  order: number
}

interface RedirectRulesProps {
  linkId: string
  isPro: boolean
}

const TYPE_LABELS = {
  country: { label: 'País', icon: Globe },
  device: { label: 'Dispositivo', icon: Smartphone },
  time: { label: 'Horário', icon: Clock },
}

const DEVICE_OPTIONS = ['mobile', 'desktop', 'tablet']

const COUNTRY_OPTIONS = [
  { code: 'BR', name: 'Brasil' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'PT', name: 'Portugal' },
  { code: 'AR', name: 'Argentina' },
  { code: 'MX', name: 'México' },
  { code: 'CO', name: 'Colômbia' },
  { code: 'CL', name: 'Chile' },
  { code: 'ES', name: 'Espanha' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'DE', name: 'Alemanha' },
  { code: 'FR', name: 'França' },
  { code: 'IT', name: 'Itália' },
]

export function RedirectRules({ linkId, isPro }: RedirectRulesProps) {
  const [rules, setRules] = useState<RedirectRule[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newType, setNewType] = useState<'country' | 'device' | 'time'>('country')
  const [newCondition, setNewCondition] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [timeStart, setTimeStart] = useState('08:00')
  const [timeEnd, setTimeEnd] = useState('18:00')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/links/${linkId}/redirect-rules`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRules(data) })
      .finally(() => setLoading(false))
  }, [linkId])

  async function handleAdd() {
    const condition = newType === 'time' ? `${timeStart}-${timeEnd}` : newCondition
    if (!condition || !newUrl) return

    setSaving(true)
    try {
      const res = await fetch(`/api/links/${linkId}/redirect-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          condition,
          url: newUrl,
          order: rules.length,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setRules((prev) => [...prev, data])
        setAdding(false)
        setNewCondition('')
        setNewUrl('')
        setTimeStart('08:00')
        setTimeEnd('18:00')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(ruleId: string) {
    setDeletingId(ruleId)
    try {
      await fetch(`/api/links/${linkId}/redirect-rules/${ruleId}`, { method: 'DELETE' })
      setRules((prev) => prev.filter((r) => r.id !== ruleId))
    } finally {
      setDeletingId(null)
    }
  }

  if (!isPro) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Redirect condicional disponível nos planos{' '}
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Redirect Condicional</CardTitle>
          {!adding && (
            <Button size="sm" variant="outline" onClick={() => setAdding(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Adicionar regra
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Form nova regra */}
        {adding && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <p className="text-sm font-medium">Nova regra</p>


            {/* Tipo */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              Tipo de regra
              <FieldTooltip content="Define o que será verificado para redirecionar: país de origem do visitante, tipo de dispositivo (celular/desktop) ou horário do acesso (em UTC)." />
            </div>
            <Select value={newType} onValueChange={(v) => { setNewType(v as typeof newType); setNewCondition('') }}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="country">País</SelectItem>
                <SelectItem value="device">Dispositivo</SelectItem>
                <SelectItem value="time">Horário (UTC)</SelectItem>
              </SelectContent>
            </Select>

            {/* Condição */}
            {newType === 'country' && (
              <Select value={newCondition} onValueChange={setNewCondition}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {newType === 'device' && (
              <Select value={newCondition} onValueChange={setNewCondition}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o dispositivo" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-1 text-sm font-medium mb-1.5">
              Tipo de regra
              <FieldTooltip content="Define o que será verificado para redirecionar: país de origem do visitante, tipo de dispositivo (celular/desktop) ou horário do acesso (em UTC)." />
            </div>


            {newType === 'time' && (
              <div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  Intervalo de horário
                  <FieldTooltip content="Horário em UTC (Brasília = UTC-3). Ex: para redirecionar entre 9h e 18h no Brasil, use 12:00-21:00. Suporta intervalos que passam da meia-noite (ex: 22:00-06:00)." />
                </div>
                <div className="flex items-center gap-2">
                  <Input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className="h-9" />
                  <span className="text-sm text-muted-foreground">até</span>
                  <Input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className="h-9" />
                </div>
              </div>
            )}

            {/* URL destino */}
            <Input
              placeholder="https://destino.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="h-9"
            />

            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de regras */}
        {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}

        {!loading && rules.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">
            Nenhuma regra configurada. Cliques vão para a URL original.
          </p>
        )}

        {rules.map((rule) => {
          const meta = TYPE_LABELS[rule.type]
          const Icon = meta.icon
          return (
            <div key={rule.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{meta.label}</Badge>
                  <span className="text-sm font-medium">{rule.condition}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{rule.url}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(rule.id)}
                disabled={deletingId === rule.id}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}