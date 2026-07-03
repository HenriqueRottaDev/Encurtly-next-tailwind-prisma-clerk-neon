'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, FileSpreadsheet, Lock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ReportButtonsProps {
  plan: 'FREE' | 'BASIC' | 'PRO' | 'AGENCY'  // 👈 adiciona BASIC
  workspaceId?: string
}

const PLAN_LABELS = { FREE: 0, BASIC: 0, PRO: 3, AGENCY: 12 }

export function ReportButtons({ plan, workspaceId }: ReportButtonsProps) {
  const [loadingCsv, setLoadingCsv] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)

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

  const months = PLAN_LABELS[plan]
  const params = workspaceId ? `?workspaceId=${workspaceId}` : ''

  async function download(type: 'csv' | 'pdf') {
    const setLoading = type === 'csv' ? setLoadingCsv : setLoadingPdf
    setLoading(true)
    try {
      const res = await fetch(`/api/reports/${type}${params}`)
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
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">
        Últimos {months} meses
      </span>
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