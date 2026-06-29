'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { FieldTooltip } from '@/components/ui/field-tooltip'

async function createLink(data: {
  url: string
  slug?: string
  title?: string
  password?: string
  expiresAt?: string
  maxClicks?: number
  ctaEnabled?: boolean
  ctaTitle?: string
  ctaMessage?: string
  ctaButtonText?: string
  ctaButtonUrl?: string
  workspaceId?: string
}) {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
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
  workspaceId?: string
}

export function CreateLinkForm({ onClose, workspaceId }: CreateLinkFormProps) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined)
  const [maxClicks, setMaxClicks] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const [ctaEnabled, setCtaEnabled] = useState(false)
  const [ctaTitle, setCtaTitle] = useState('')
  const [ctaMessage, setCtaMessage] = useState('')
  const [ctaButtonText, setCtaButtonText] = useState('')
  const [ctaButtonUrl, setCtaButtonUrl] = useState('')

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
      expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
      maxClicks: maxClicks ? parseInt(maxClicks) : undefined,
      ctaEnabled,
      ctaTitle: ctaEnabled ? ctaTitle || undefined : undefined,
      ctaMessage: ctaEnabled ? ctaMessage || undefined : undefined,
      ctaButtonText: ctaEnabled ? ctaButtonText || undefined : undefined,
      ctaButtonUrl: ctaEnabled ? ctaButtonUrl || undefined : undefined,
      workspaceId: workspaceId || undefined,
    })
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base">Encurtar novo link</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="https://exemplo.com/url-muito-longa"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                Slug personalizado
                <FieldTooltip content="Parte final da URL encurtada. Ex: /meu-link. Use letras, números, hífens e underscores (3-50 caracteres). Se deixar em branco, será gerado automaticamente." />
              </label>
              <Input
                placeholder="meu-link (opcional)"
                value={slug}
                onChange={e => setSlug(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                Título
                <FieldTooltip content="Nome interno para identificar o link no seu dashboard. Não aparece para quem clica." />
              </label>
              <Input
                placeholder="Título (opcional)"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>

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
                  <label className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    Senha de acesso
                    <FieldTooltip content="Quem clicar no link precisará digitar esta senha antes de ser redirecionado. Útil para conteúdo exclusivo." />
                  </label>
                  <Input
                    type="password"
                    placeholder="Deixe vazio para não proteger"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    Máximo de cliques
                    <FieldTooltip content="O link para de funcionar após atingir este número de cliques. Útil para ofertas limitadas." />
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
                <label className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  Data de expiração
                  <FieldTooltip content="Após esta data e hora, o link deixa de funcionar e redireciona para a página inicial." />
                </label>
                <DateTimePicker value={expiresAt} onChange={setExpiresAt} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowCta(!showCta)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCta ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            CTA personalizado (plano Free)
            <FieldTooltip content="Usuários Free veem uma página intermediária antes do redirecionamento. Você pode personalizar essa página com uma mensagem e botão próprios." />
          </button>

          {showCta && (
            <div className="space-y-3 pt-1 border-t border-border">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={ctaEnabled}
                  onChange={e => setCtaEnabled(e.target.checked)}
                />
                Mostrar CTA antes de redirecionar
              </label>
              <p className="text-xs text-muted-foreground">
                Se desativado, será exibido um anúncio padrão no lugar do CTA.
              </p>
              {ctaEnabled && (
                <div className="space-y-3">
                  <Input
                    placeholder="Título (ex: Me siga no Instagram!)"
                    value={ctaTitle}
                    onChange={e => setCtaTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Mensagem (opcional)"
                    value={ctaMessage}
                    onChange={e => setCtaMessage(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Texto do botão (ex: Seguir)"
                      value={ctaButtonText}
                      onChange={e => setCtaButtonText(e.target.value)}
                    />
                    <Input
                      placeholder="URL do botão"
                      value={ctaButtonUrl}
                      onChange={e => setCtaButtonUrl(e.target.value)}
                    />
                  </div>
                </div>
              )}
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