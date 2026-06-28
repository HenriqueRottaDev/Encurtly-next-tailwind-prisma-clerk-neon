import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { HeroVisual } from '@/components/landing/hero-visual'
import {
  BarChart3, Link2, QrCode, Lock, ShieldCheck, Zap,
  Brain, GitBranch, Upload, Users, Globe, Megaphone,
  Check, ArrowRight, Building2,
} from 'lucide-react'

const features = [
  {
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
    title: 'Analytics completo',
    desc: 'Cliques por dia, país, dispositivo, navegador e origem do tráfego.',
  },
  {
    icon: <Brain className="w-5 h-5 text-primary" />,
    title: 'AI Insights',
    desc: 'Resumo automático das suas métricas gerado por inteligência artificial.',
    badge: 'Novo',
  },
  {
    icon: <GitBranch className="w-5 h-5 text-primary" />,
    title: 'Redirect condicional',
    desc: 'Redirecione visitantes por país, dispositivo ou horário automaticamente.',
    badge: 'Novo',
  },
  {
    icon: <Link2 className="w-5 h-5 text-primary" />,
    title: 'Links personalizados',
    desc: 'Crie slugs customizados e fáceis de lembrar para suas campanhas.',
  },
  {
    icon: <QrCode className="w-5 h-5 text-primary" />,
    title: 'QR Code automático',
    desc: 'Cada link gera um QR Code pronto para usar em materiais impressos.',
  },
  {
    icon: <Lock className="w-5 h-5 text-primary" />,
    title: 'Proteção por senha',
    desc: 'Restrinja o acesso a links sensíveis com senha e data de expiração.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    title: 'LGPD em primeiro lugar',
    desc: 'Seus dados e os dos seus visitantes ficam armazenados no Brasil.',
  },
  {
    icon: <Zap className="w-5 h-5 text-primary" />,
    title: 'Zero anúncios',
    desc: 'Sem banners ou interstitials antes do redirecionamento. Nunca.',
  },
  {
    icon: <Upload className="w-5 h-5 text-primary" />,
    title: 'Upload em massa',
    desc: 'Importe dezenas de links de uma vez via CSV com relatório de erros.',
    badge: 'Novo',
  },
]

const agencyFeatures = [
  {
    icon: <Users className="w-5 h-5 text-violet-300" />,
    title: 'Workspaces para equipes',
    desc: 'Organize links por cliente com papéis Admin, Editor e Visualizador.',
  },
  {
    icon: <Globe className="w-5 h-5 text-violet-300" />,
    title: 'Domínios personalizados',
    desc: 'Cada workspace pode ter seu próprio domínio. Até 10 domínios por conta.',
  },
  {
    icon: <Upload className="w-5 h-5 text-violet-300" />,
    title: 'Upload em massa via CSV',
    desc: 'Crie centenas de links de uma vez para campanhas de grande escala.',
  },
  {
    icon: <Brain className="w-5 h-5 text-violet-300" />,
    title: 'AI Insights por link',
    desc: 'Análise automática de performance com sugestões acionáveis.',
  },
]

const pricingPlans = [
  {
    name: 'Free',
    price: 'R$0',
    period: 'para sempre',
    description: 'Para começar a encurtar links.',
    features: ['50 links', '1.000 cliques/mês', 'Analytics básico', 'QR Code automático', 'CTA overlay'],
    cta: 'Começar grátis',
    href: '/sign-up',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$29',
    period: 'por mês',
    description: 'Para criadores e profissionais de marketing.',
    features: ['Links ilimitados', '25.000 cliques/mês', 'Analytics completo', 'AI Insights', 'Redirect condicional', '1 domínio personalizado'],
    cta: 'Assinar Pro',
    href: '/sign-up',
    highlighted: true,
  },
  {
    name: 'Agência',
    price: 'R$79',
    period: 'por mês',
    description: 'Para agências com múltiplos clientes.',
    features: ['Links ilimitados', '250.000 cliques/mês', 'Tudo do Pro', 'Workspaces', 'Até 10 domínios', 'Upload em massa CSV', 'Permissões granulares'],
    cta: 'Assinar Agência',
    href: '/sign-up',
    highlighted: false,
  },
]

export default async function HomePage() {
  const { userId } = await auth()
  const isLoggedIn = !!userId

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight text-primary">
            Encurtly
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <a href="#funcionalidades">Funcionalidades</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="#planos">Planos</a>
            </Button>
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">Meus Links</Link>
                </Button>
                <UserButton />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/sign-in">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/sign-up">Criar conta</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Copy */}
          <div>
            <Badge variant="secondary" className="mb-5 gap-1.5">
              🇧🇷 Dados 100% hospedados no Brasil
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight mb-4">
              Links inteligentes para campanhas que{' '}
              <span className="text-primary">convertem.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Analytics completo, AI Insights, redirect condicional e workspaces para equipes — tudo sem anúncios, em conformidade com a LGPD.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Começar gratuitamente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#planos">Ver planos</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-500" /> Grátis para começar
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-500" /> Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-green-500" /> LGPD compliant
              </span>
            </div>
          </div>

          {/* Visual */}
          <div className="flex justify-center">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">10.000+</p>
              <p className="text-sm text-muted-foreground">links criados</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">Zero</p>
              <p className="text-sm text-muted-foreground">anúncios mostrados</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">100%</p>
              <p className="text-sm text-muted-foreground">LGPD compliant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Como funciona</p>
          <h2 className="text-3xl font-semibold tracking-tight">Três passos. Resultados imediatos.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Crie seu link',
              desc: 'Cole a URL longa, personalize o slug e configure opções avançadas como senha, expiração e CTA.',
            },
            {
              step: '02',
              title: 'Compartilhe',
              desc: 'Distribua em redes sociais, e-mail, WhatsApp ou materiais impressos com o QR Code gerado automaticamente.',
            },
            {
              step: '03',
              title: 'Analise',
              desc: 'Veja de onde vêm os cliques, em qual dispositivo, país e navegador — com AI Insights para resumir os dados.',
            },
          ].map((s) => (
            <div key={s.step} className="relative">
              <div className="text-5xl font-bold text-primary/10 mb-4 select-none">{s.step}</div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Funcionalidades</p>
          <h2 className="text-3xl font-semibold tracking-tight">Tudo que você precisa, sem o que não precisa.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  {f.icon}
                </div>
                {f.badge && (
                  <Badge className="text-xs bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500/10">
                    {f.badge}
                  </Badge>
                )}
              </div>
              <h3 className="font-medium mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Para agências */}
      <section className="bg-gradient-to-br from-violet-950 via-slate-900 to-violet-950">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-violet-500/20 text-violet-300 border-violet-500/20 hover:bg-violet-500/20">
                <Building2 className="w-3 h-3 mr-1" />
                Plano Agência
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight text-white mb-4">
                Para agências que gerenciam múltiplos clientes.
              </h2>
              <p className="text-violet-200/70 leading-relaxed mb-8">
                Crie workspaces separados por cliente, com domínio personalizado, permissões granulares e upload em massa — tudo em uma conta.
              </p>
              <Button asChild className="bg-white text-violet-950 hover:bg-violet-50">
                <Link href="/pricing">
                  Ver plano Agência
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agencyFeatures.map((f) => (
                <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center mb-3">
                    {f.icon}
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-violet-200/60 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wide">Planos</p>
          <h2 className="text-3xl font-semibold tracking-tight">Simples. Sem surpresas.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-primary ring-2 ring-primary/20 relative'
                  : 'border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Mais popular</Badge>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground mb-1">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={plan.highlighted ? 'default' : 'outline'}
                className="w-full"
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-3">
            Seus links merecem mais do que uma URL longa.
          </h2>
          <p className="text-muted-foreground mb-8">
            Crie sua conta gratuitamente. Sem cartão de crédito.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Criar conta grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">Ver planos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Encurtly. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Termos de Uso</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Planos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}