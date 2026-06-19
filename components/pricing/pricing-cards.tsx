'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/plans'

interface PricingCardsProps {
  currentPlan: string
  isLoggedIn: boolean
}

const PRICES = {
  FREE: 'R$ 0',
  PRO: 'R$ 29',
  AGENCY: 'R$ 79',
}

export function PricingCards({ currentPlan, isLoggedIn }: PricingCardsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (plan: 'PRO' | 'AGENCY') => {
    if (!isLoggedIn) {
      router.push('/sign-up')
      return
    }

    setLoading(plan)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      console.error('Erro ao criar checkout')
    } finally {
      setLoading(null)
    }
  }

  const handleManage = async () => {
    setLoading('MANAGE')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      console.error('Erro ao abrir portal')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* FREE */}
      <Card className={currentPlan === 'FREE' ? 'border-primary/50' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Free</CardTitle>
            {currentPlan === 'FREE' && (
              <Badge variant="secondary">Plano atual</Badge>
            )}
          </div>
          <CardDescription>Para experimentar e uso pessoal</CardDescription>
          <div className="pt-2">
            <span className="text-3xl font-semibold">R$ 0</span>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {PLANS.FREE.features.map(feature => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="w-full"
            variant="outline"
            disabled={currentPlan === 'FREE' || !isLoggedIn}
            onClick={() => isLoggedIn ? null : router.push('/sign-up')}
          >
            {currentPlan === 'FREE' ? 'Plano atual' : 'Começar grátis'}
          </Button>
        </CardContent>
      </Card>

      {/* PRO */}
      <Card className={`relative ${currentPlan === 'PRO' ? 'border-primary/50' : 'border-primary'}`}>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Mais popular</Badge>
        </div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pro</CardTitle>
            {currentPlan === 'PRO' && (
              <Badge variant="secondary">Plano atual</Badge>
            )}
          </div>
          <CardDescription>Para criadores e pequenos negócios</CardDescription>
          <div className="pt-2">
            <span className="text-3xl font-semibold">R$ 29</span>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {PLANS.PRO.features.map(feature => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          {currentPlan === 'PRO' ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleManage}
              disabled={loading === 'MANAGE'}
            >
              {loading === 'MANAGE' ? 'Carregando...' : 'Gerenciar assinatura'}
            </Button>
          ) : (
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => handleSubscribe('PRO')}
              disabled={!!loading}
            >
              {loading === 'PRO' ? 'Carregando...' : 'Assinar Pro'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* AGENCY */}
      <Card className={currentPlan === 'AGENCY' ? 'border-primary/50' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Agência</CardTitle>
            {currentPlan === 'AGENCY' && (
              <Badge variant="secondary">Plano atual</Badge>
            )}
          </div>
          <CardDescription>Para agências com múltiplos clientes</CardDescription>
          <div className="pt-2">
            <span className="text-3xl font-semibold">R$ 79</span>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {PLANS.AGENCY.features.map(feature => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          {currentPlan === 'AGENCY' ? (
            <Button
              className="w-full"
              variant="outline"
              onClick={handleManage}
              disabled={loading === 'MANAGE'}
            >
              {loading === 'MANAGE' ? 'Carregando...' : 'Gerenciar assinatura'}
            </Button>
          ) : (
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleSubscribe('AGENCY')}
              disabled={!!loading}
            >
              {loading === 'AGENCY' ? 'Carregando...' : 'Assinar Agência'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}