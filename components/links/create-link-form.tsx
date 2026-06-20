'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DateTimePicker } from '@/components/ui/datetime-picker'

async function createLink(data: {
  url: string
  slug?: string
  title?: string
  password?: string
  expiresAt?: string
  maxClicks?: number
}) {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    // Se o erro for um objeto do Zod, extrai a mensagem legível
    if (typeof err.error === 'object') {
      const fieldErrors = err.error?.fieldErrors
      const firstField = fieldErrors ? Object.keys(fieldErrors)[0] : null
      const firstMessage = firstField ? fieldErrors[firstField]?.[0] : null
      throw new Error(firstMessage ?? 'Dados inválidos')
    }
    throw new Error(err.error || 'Erro ao criar link')
  }
  return res.json()
}

interface CreateLinkFormProps {
  onClose: () => void
}

export function CreateLinkForm({ onClose }: CreateLinkFormProps) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined)
  const [maxClicks, setMaxClicks] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const mutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      router.refresh()
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    mutation.mutate({
      url,
      slug: slug || undefined,
      title: title || undefined,
      password: password || undefined,
      // toISOString() sempre gera formato válido independente do idioma do navegador
      expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
      maxClicks: maxClicks ? parseInt(maxClicks) : undefined,
    })
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base">Encurtar novo link</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Campos principais */}
          <Input
            placeholder="https://exemplo.com/url-muito-longa"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Input
              placeholder="Slug personalizado (opcional)"
              value={slug}
              onChange={e => setSlug(e.target.value)}
            />
            <Input
              placeholder="Título (opcional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Opções avançadas */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Opções avançadas
          </button>

          {showAdvanced && (
            <div className="space-y-3 pt-1 border-t border-border">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Senha de acesso
                  </label>
                  <Input
                    type="password"
                    placeholder="Deixe vazio para não proteger"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Máximo de cliques
                  </label>
                  <Input
                    type="number"
                    placeholder="Ex: 100"
                    min={1}
                    value={maxClicks}
                    onChange={e => setMaxClicks(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Data de expiração
                </label>
                <DateTimePicker value={expiresAt} onChange={setExpiresAt} />
              </div>
            </div>
          )}

          {mutation.error && (
            <div className="space-y-2">
              <p className="text-sm text-destructive">{mutation.error.message}</p>
              {mutation.error.message.includes('limite') && (
                <Button size="sm" variant="outline" asChild>
                  <a href="/pricing">Ver planos</a>
                </Button>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {mutation.isPending ? 'Encurtando...' : 'Encurtar'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}