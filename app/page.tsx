import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Link2,
  BarChart3,
  ShieldCheck,
  QrCode,
  Lock,
  Zap,
} from 'lucide-react'

export default async function HomePage() {
  const { userId } = await auth()
  const isLoggedIn = !!userId

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight text-primary">
            Encurtly
          </span>
          <nav className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Meus Links</Link>
                </Button>
                <UserButton />
              </>
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
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          🇧🇷 Dados 100% hospedados no Brasil
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
          Encurte links.{' '}
          <span className="text-primary">Entenda seu público.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Links curtos, analytics completo e zero anúncios. Tudo o que você
          precisa para acompanhar o desempenho das suas campanhas — em
          conformidade com a LGPD.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-up">Começar gratuitamente</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/sign-in">Já tenho conta</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Link2 className="w-5 h-5 text-primary" />}
            title="Links personalizados"
            description="Crie slugs customizados e fáceis de lembrar para suas campanhas."
          />
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5 text-primary" />}
            title="Analytics completo"
            description="Cliques por dia, país, dispositivo, navegador e origem do tráfego."
          />
          <FeatureCard
            icon={<QrCode className="w-5 h-5 text-primary" />}
            title="QR Code automático"
            description="Cada link gera um QR Code pronto para usar em materiais impressos."
          />
          <FeatureCard
            icon={<Lock className="w-5 h-5 text-primary" />}
            title="Proteção por senha"
            description="Restrinja o acesso a links sensíveis com senha e expiração."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-5 h-5 text-primary" />}
            title="LGPD em primeiro lugar"
            description="Seus dados e os dos seus visitantes ficam armazenados no Brasil."
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-primary" />}
            title="Zero anúncios"
            description="Sem banners ou interstitials antes do redirecionamento. Nunca."
          />
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold tracking-tight mb-3">
          Pronto para começar?
        </h2>
        <p className="text-muted-foreground mb-6">
          Crie sua conta gratuita e comece a encurtar links em segundos.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-up">Criar conta gratuita</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/pricing">Ver planos</Link>
          </Button>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Encurtly. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">Privacidade</Link>
            <Link href="/terms" className="hover:text-foreground">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border border-border rounded-lg p-5">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}