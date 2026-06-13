import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import { CopyButton } from './copy-button'
import { LinkWithClickCount } from '@/lib/repositories/link.repository'

interface LinkCardProps {
  link: LinkWithClickCount
}

export function LinkCard({ link }: LinkCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-violet-600 text-sm">
              /r/{link.slug}
            </span>
            <Badge variant="secondary" className="text-xs">
              {link._count.clicks} {link._count.clicks === 1 ? 'clique' : 'cliques'}
            </Badge>
            {link.disabled && (
              <Badge variant="destructive" className="text-xs">Pausado</Badge>
            )}
            {link.expiresAt && new Date() > new Date(link.expiresAt) && (
              <Badge variant="outline" className="text-xs text-orange-500 border-orange-300">
                Expirado
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 truncate mt-0.5">
            {link.title || link.url}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(link.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <CopyButton slug={link.slug} />
          <Button size="sm" variant="ghost" asChild>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}