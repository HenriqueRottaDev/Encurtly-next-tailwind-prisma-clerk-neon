'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
}

interface AcceptInviteCardProps {
  token: string
  workspaceName: string
  role: string
}

export function AcceptInviteCard({ token, workspaceName, role }: AcceptInviteCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAccept() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invite/${token}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao aceitar convite.'); return }
      router.push(`/dashboard/workspaces/${data.workspaceId}`)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Você foi convidado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Para participar do workspace</p>
          <p className="font-semibold text-lg mt-1">{workspaceName}</p>
          <div className="flex justify-center mt-2">
            <Badge variant="secondary">{ROLE_LABELS[role] ?? role}</Badge>
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}

        <Button onClick={handleAccept} disabled={loading} className="w-full">
          {loading ? 'Aceitando...' : 'Aceitar convite'}
        </Button>
      </CardContent>
    </Card>
  )
}