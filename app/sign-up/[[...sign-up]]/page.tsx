import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <SignUp fallbackRedirectUrl="/dashboard" />
      <p className="text-xs text-muted-foreground text-center max-w-sm">
        Ao criar uma conta, você concorda com nossos{' '}
        <Link href="/terms" className="text-primary hover:underline">Termos de Uso</Link>{' '}
        e{' '}
        <Link href="/privacy" className="text-primary hover:underline">Política de Privacidade</Link>.
      </p>
    </div>
  )
}