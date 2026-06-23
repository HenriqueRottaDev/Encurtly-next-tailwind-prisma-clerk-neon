import { LinkCard } from './link-card'
import { LinkWithClickCount } from '@/lib/repositories/link.repository'

export function LinkList({ links }: { links: LinkWithClickCount[] }) {
  return (
    <div className="space-y-3">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          selected={false}
          onToggle={() => {}}
        />
      ))}
    </div>
  )
}