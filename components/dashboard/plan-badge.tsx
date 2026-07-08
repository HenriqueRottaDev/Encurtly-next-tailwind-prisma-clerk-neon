import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface PlanBadgeProps {
  plan: 'FREE' | 'BASIC' | 'PRO' | 'AGENCY'
}

const PLAN_CONFIG = {
  FREE: {
    label: 'Trial',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
    glow: false,
  },
  BASIC: {
    label: 'Básico',
    className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    glow: false,
  },
  PRO: {
    label: 'Pro',
    className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    glow: true,
  },
  AGENCY: {
    label: 'Agência',
    className: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    glow: true,
  },
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  const config = PLAN_CONFIG[plan]

  return (
    <div
      className={cn(
        'relative inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium overflow-hidden',
        config.className
      )}
    >
      {config.glow && (
        <span className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
      {(plan === 'PRO' || plan === 'AGENCY') && <Sparkles className="h-3 w-3 relative" />}
      <span className="relative">{config.label}</span>
    </div>
  )
}