'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle2, XCircle, Lock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RowResult {
  row: number
  url: string
  slug?: string
  success: boolean
  error?: string
}

interface UploadResult {
  succeeded: number
  failed: number
  results: RowResult[]
}

interface BulkUploadProps {
  isPro: boolean
}

const CSV_TEMPLATE = `url,slug,title,password,expiresAt,maxClicks,ctaEnabled,ctaTitle,ctaMessage,ctaButtonText,ctaButtonUrl
https://exemplo.com,meu-link,Meu Link,,2025-12-31,100,false,,,, 
https://outro.com,,Outro Link,,,,,,,,`

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'encurtly-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function BulkUpload({ isPro }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!isPro) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Upload em massa disponível nos planos{' '}
          <span className="font-medium text-foreground">Pro</span> e{' '}
          <span className="font-medium text-foreground">Agência</span>.
        </p>
        <Button variant="outline" size="sm" className="ml-auto shrink-0" asChild>
          <a href="/pricing">Ver planos</a>
        </Button>
      </div>
    )
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/links/bulk', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao processar arquivo.'); return }
      setResult(data)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Upload em massa</CardTitle>
          <Button variant="ghost" size="sm" onClick={downloadTemplate} className="gap-1.5 text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            Baixar template
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Drop area */}
        <div
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 px-6 py-8 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          {file ? (
            <>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Clique para selecionar o CSV</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Apenas arquivos .csv
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) { setFile(f); setResult(null); setError(null) }
            }}
          />
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        {file && (
          <Button onClick={handleUpload} disabled={loading} className="w-full">
            {loading ? 'Processando...' : 'Importar links'}
          </Button>
        )}

        {/* Resultado */}
        {result && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-green-500/10 px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{result.succeeded}</p>
                <p className="text-xs text-muted-foreground">criados</p>
              </div>
              <div className="flex-1 rounded-lg bg-destructive/10 px-4 py-3 text-center">
                <p className="text-2xl font-semibold text-destructive">{result.failed}</p>
                <p className="text-xs text-muted-foreground">com erro</p>
              </div>
            </div>

            {/* Linhas com erro */}
            {result.results.filter((r) => !r.success).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Erros
                </p>
                {result.results
                  .filter((r) => !r.success)
                  .map((r) => (
                    <div key={r.row} className="flex items-start gap-2 rounded-md bg-destructive/5 px-3 py-2">
                      <XCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">Linha {r.row} — {r.error}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.url || '(sem URL)'}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Linhas com sucesso */}
            {result.results.filter((r) => r.success).length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Criados
                </p>
                {result.results
                  .filter((r) => r.success)
                  .map((r) => (
                    <div key={r.row} className="flex items-center gap-2 rounded-md bg-green-500/5 px-3 py-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate">{r.url}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{r.slug}</Badge>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}