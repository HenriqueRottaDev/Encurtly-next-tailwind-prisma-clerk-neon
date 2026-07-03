import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TrialExpiredGateProps {
  hasHadTrial: boolean
}

export function TrialExpiredGate({ hasHadTrial }: TrialExpiredGateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {hasHadTrial ? 'Seu período de teste terminou' : 'Escolha um plano para continuar'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {hasHadTrial
                ? 'Escolha um plano para continuar criando e gerenciando seus links.'
                : 'Para usar o Encurtly, escolha o plano que melhor se encaixa com você.'}
            </p>
          </div>
          <Button size="lg" asChild className="w-full">
            <Link href="/pricing">
              Ver planos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}