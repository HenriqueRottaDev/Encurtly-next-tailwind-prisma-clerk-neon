import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { UserRepository } from '@/lib/repositories'
import { DomainSettings } from '@/components/domains/domain-settings'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await UserRepository.findByClerkId(userId)
  if (!user) redirect('/sign-in')

  if (user.plan === 'FREE' || user.plan === 'BASIC') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie as configurações da sua conta</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Domínios personalizados disponíveis nos planos{' '}
            <span className="font-medium text-foreground">Pro</span> e{' '}
            <span className="font-medium text-foreground">Agência</span>.
          </p>
          <a href="/pricing" className="ml-auto shrink-0 text-sm text-primary underline">Ver planos</a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie as configurações da sua conta</p>
      </div>
      <DomainSettings
        apiPath="/api/domains"
        plan={user.plan}
        maxDomains={user.plan === 'PRO' ? 1 : 10}
      />
    </div>
  )
}