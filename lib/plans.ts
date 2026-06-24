export const PLANS = {
  FREE: {
    name: 'Free',
    maxLinks: 50,
    maxClicks: 1000,
    features: [
      'Até 50 links',
      '1.000 cliques rastreados/mês',
      'QR Code ilimitado',
      'Slug personalizado',
      'Senha e expiração de link',
      'Analytics básico',
    ],
  },
  PRO: {
    name: 'Pro',
    maxLinks: Infinity,
    maxClicks: 25000,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      'Links ilimitados',
      '25.000 cliques rastreados/mês',
      'Analytics completo',
      'UTM builder automático',
      '1 domínio personalizado',
      'CTA Overlay',
      'Insights com IA',
      'Exportar relatórios (CSV)',
    ],
  },
  AGENCY: {
    name: 'Agência',
    maxLinks: Infinity,
    maxClicks: 250000,
    stripePriceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    features: [
      'Links ilimitados',
      '250.000 cliques rastreados/mês',
      '10 domínios personalizados',
      'Múltiplos workspaces',
      'Times com permissões',
      'CTA Overlay personalizado',
      'Insights com IA avançado',
      'Upload em massa (CSV)',
      'API com maior limite',
      'Suporte prioritário',
    ],
  },
} as const

export type PlanType = keyof typeof PLANS