import type { RedirectRule } from '@prisma/client'

interface MatchContext {
  country: string | null
  device: string | null
  currentTime: string // "HH:MM" em UTC
}

function matchesRule(rule: RedirectRule, ctx: MatchContext): boolean {
  switch (rule.type) {
    case 'country':
      return ctx.country?.toUpperCase() === rule.condition.toUpperCase()

    case 'device':
      return ctx.device?.toLowerCase() === rule.condition.toLowerCase()

    case 'time': {
      const [start, end] = rule.condition.split('-')
      if (!start || !end) return false
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const [ch, cm] = ctx.currentTime.split(':').map(Number)
      const current = ch * 60 + cm
      const startMin = sh * 60 + sm
      const endMin = eh * 60 + em
      // suporta overnight (ex: 22:00-06:00)
      if (startMin <= endMin) return current >= startMin && current <= endMin
      return current >= startMin || current <= endMin
    }

    default:
      return false
  }
}

export function resolveRedirectUrl(
  rules: RedirectRule[],
  ctx: MatchContext
): string | null {
  const sorted = [...rules].sort((a, b) => a.order - b.order)
  for (const rule of sorted) {
    if (matchesRule(rule, ctx)) return rule.url
  }
  return null
}