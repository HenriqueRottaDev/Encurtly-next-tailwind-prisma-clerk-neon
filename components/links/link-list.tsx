import { Card, CardContent } from '@/components/ui/card'
import { Link as LinkIcon } from 'lucide-react'
import { LinkCard } from './link-card'
import { LinkWithClickCount } from '@/lib/repositories/link.repository'

interface LinkListProps {
  links: LinkWithClickCount[]
}

export function LinkList({ links }: LinkListProps) {
  if (links.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <LinkIcon className="w-10 h-10 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">Nenhum link ainda</p>
          <p className="text-sm text-slate-400 mt-1">
            Clique em "Novo Link" para começar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {links.map(link => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  )
}