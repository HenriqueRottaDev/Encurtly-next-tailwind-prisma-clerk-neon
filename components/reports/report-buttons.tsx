'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, FileSpreadsheet, Lock } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface ReportButtonsProps {
  plan: 'FREE' | 'BASIC' | 'PRO' | 'AGENCY'
  workspaceId?: string
}

const DAYS_OPTIONS: Record<string, { value: number; label: string }[]> = {
  PRO: [
    { value: 7, label: 'Últimos 7 dias' },
    { value: 30, label: 'Últimos 30 dias' },
    { value: 60, label: 'Últimos 60 dias' },
    { value: 90, label: 'Últimos 90 dias' },
  ],
  AGENCY: [
    { value: 7, label: 'Últimos 7 dias' },
    { value: 30, label: 'Últimos 30 dias' },
    { value: 90, label: 'Últimos 90 dias' },
    { value: 180, label: 'Últimos 180 dias' },
    { value: 365, label: 'Últimos 12 meses' },
  ],
}

export function ReportButtons({ plan, workspaceId }: ReportButtonsProps) {
  const [loadingCsv, setLoadingCsv] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

  const options = DAYS_OPTIONS[plan] ?? DAYS_OPTIONS.PRO
  const [days, setDays] = useState(options[1]?.value ?? 30)

  if (plan === 'FREE' || plan === 'BASIC') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Relatórios disponíveis nos planos Pro e Agência.</span>
        <Button variant="outline" size="sm" asChild>
          <a href="/pricing">Ver planos</a>
        </Button>
      </div>
    )
  }

  const params = new URLSearchParams()
  params.set('days', String(days))
  if (workspaceId) params.set('workspaceId', workspaceId)

  async function download(type: 'csv' | 'pdf') {
    const setLoading = type === 'csv' ? setLoadingCsv : setLoadingPdf
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${type}?${params.toString()}`)
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error ?? 'Erro ao gerar relatório.')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `encurtly-relatorio-${new Date().toISOString().split('T')[0]}.${type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
        <SelectTrigger className="h-9 w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => download('csv')}
        disabled={loadingCsv}
        className="gap-1.5"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        {loadingCsv ? 'Gerando...' : 'Exportar CSV'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => download('pdf')}
        disabled={loadingPdf}
        className="gap-1.5"
      >
        <FileText className="h-3.5 w-3.5" />
        {loadingPdf ? 'Gerando...' : 'Exportar PDF'}
      </Button>
    </div>
  )
}