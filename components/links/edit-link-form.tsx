'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMutation } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { LinkWithClickCount } from '@/lib/repositories/link.repository'

interface EditLinkFormProps {
  link: LinkWithClickCount
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditLinkForm({ link, open, onOpenChange }: EditLinkFormProps) {
  const router = useRouter()

  const [url, setUrl] = useState(link.url)
  const [slug, setSlug] = useState(link.slug)
  const [title, setTitle] = useState(link.title ?? '')
  const [password, setPassword] = useState('')
  const [removePassword, setRemovePassword] = useState(false)
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(
    link.expiresAt ? new Date(link.expiresAt) : undefined
  )
  const [maxClicks, setMaxClicks] = useState(link.maxClicks?.toString() ?? '')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [showCta, setShowCta] = useState(false)
  const [ctaEnabled, setCtaEnabled] = useState(link.ctaEnabled)
  const [ctaTitle, setCtaTitle] = useState(link.ctaTitle ?? '')
  const [ctaMessage, setCtaMessage] = useState(link.ctaMessage ?? '')
  const [ctaButtonText, setCtaButtonText] = useState(link.ctaButtonText ?? '')
  const [ctaButtonUrl, setCtaButtonUrl] = useState(link.ctaButtonUrl ?? '')

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          slug,
          title: title || undefined,
          password: removePassword ? null : password || undefined,
          expiresAt: expiresAt ? expiresAt.toISOString() : null,
          maxClicks: maxClicks ? parseInt(maxClicks) : null,
          ctaEnabled,
          ctaTitle: ctaEnabled ? ctaTitle || undefined : undefined,
          ctaMessage: ctaEnabled ? ctaMessage || undefined : undefined,
          ctaButtonText: ctaEnabled ? ctaButtonText || undefined : undefined,
          ctaButtonUrl: ctaEnabled ? ctaButtonUrl || undefined : undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(typeof err.error === 'string' ? err.error : 'Erro ao salvar alterações')
      }
      return res.json()
    },
    onSuccess: () => {
      router.refresh()
      onOpenChange(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar link</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input value={url} onChange={e => setUrl(e.target.value)} required />
          <div className="flex gap-2">
            <Input
              placeholder="Slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
            />
            <Input
              placeholder="Título (opcional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
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
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Senha de acesso
                  </label>
                  <Input
                    type="password"
                    placeholder={link.password ? 'Deixe vazio para manter a atual' : 'Sem senha'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={removePassword}
                  />
                  {link.password && (
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <input
                        type="checkbox"
                        checked={removePassword}
                        onChange={e => setRemovePassword(e.target.checked)}
                      />
                      Remover senha
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Máximo de cliques
                  </label>
                  <Input
                    type="number"
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

          <button
            type="button"
            onClick={() => setShowCta(!showCta)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCta ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            CTA personalizado (plano Free)
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

              {ctaEnabled && (
                <div className="space-y-3">
                  <Input
                    placeholder="Título"
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
                      placeholder="Texto do botão"
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
            <p className="text-sm text-destructive">{mutation.error.message}</p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}