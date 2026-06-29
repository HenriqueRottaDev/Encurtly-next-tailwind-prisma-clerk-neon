'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ExternalLink, BarChart3, Pencil } from 'lucide-react'
import { CopyButton } from './copy-button'
import { QRCodeButton } from './qrcode-button'
import { LinkActions } from './link-actions'
import { EditLinkForm } from './edit-link-form'
import { LinkWithClickCount } from '@/lib/repositories/link.repository'

interface LinkCardProps {
  link: LinkWithClickCount
  selected: boolean
  onToggle: (id: string) => void
}

export function LinkCard({ link, selected, onToggle }: LinkCardProps) {
  const [editOpen, setEditOpen] = useState(false)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center gap-3 py-4">
        <Checkbox
          checked={selected}
          onCheckedChange={() => onToggle(link.id)}
          aria-label="Selecionar link"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-primary text-sm">/{link.slug}</span>
            <Badge variant="secondary" className="text-xs">
              {link._count.clicks} {link._count.clicks === 1 ? 'clique' : 'cliques'}
            </Badge>
            {link.disabled && <Badge variant="destructive" className="text-xs">Pausado</Badge>}
            {link.expiresAt && new Date() > new Date(link.expiresAt) && (
              <Badge variant="outline" className="text-xs text-orange-500 border-orange-300">
                Expirado
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{link.title || link.url}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {new Date(link.createdAt).toLocaleDateString('pt-BR')}
          </p>
          {link.expiresAt && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Expira em:{' '}
              {new Date(link.expiresAt).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button size="default" variant="ghost" asChild title="Ver analytics">
            <Link href={`/dashboard/links/${link.id}`}>
              <BarChart3 className="w-5 h-5" />
            </Link>
          </Button>
          <Button size="default" variant="ghost" title="Editar link" onClick={() => setEditOpen(true)}>
            <Pencil className="w-5 h-5" />
          </Button>
          <CopyButton slug={link.slug} />
          <QRCodeButton linkId={link.id} slug={link.slug} />
          <Button size="default" variant="ghost" asChild>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-5 h-5" />
            </a>
          </Button>
          <LinkActions linkId={link.id} disabled={link.disabled} />
        </div>
      </CardContent>
      <EditLinkForm link={link} open={editOpen} onOpenChange={setEditOpen} />
    </Card>
  )
}