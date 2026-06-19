import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PricingCards } from '@/components/pricing/pricing-cards' 
import { UserRepository } from '@/lib/repositories'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function PricingPage() {
  const { userId } = await auth()

  let currentPlan = 'FREE'

  if (userId) {
    const user = await UserRepository.findByClerkId(userId)
    currentPlan = user?.plan ?? 'FREE'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight text-primary">
            Encurtly
          </Link>
          <div className="flex items-center gap-2">
            {userId ? (
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Meu dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/sign-in">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Criar conta</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight mb-4">
          Planos simples e transparentes
        </h1>
        <p className="text-lg text-muted-foreground">
          Comece gratuitamente e faça upgrade quando precisar. Sem surpresas.
        </p>
      </section>

      {/* Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <PricingCards currentPlan={currentPlan} isLoggedIn={!!userId} />
      </section>

      {/* LGPD Badge */}
      <section className="border-t border-border py-8 text-center">
        <p className="text-sm text-muted-foreground">
          🇧🇷 Dados 100% hospedados no Brasil • Conformidade total com a LGPD • Pagamentos seguros via Stripe
        </p>
      </section>
    </div>
  )
}