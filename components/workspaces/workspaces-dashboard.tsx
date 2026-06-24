'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Lock, Users, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Member {
  userId: string
  role: string
  user: { id: string; name: string | null; email: string }
}

interface Workspace {
  id: string
  name: string
  slug: string
  members: Member[]
  _count: { links: number }
}

interface WorkspacesDashboardProps {
  workspaces: Workspace[]
  isAgency: boolean
  userId: string
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
}

export function WorkspacesDashboard({ workspaces, isAgency, userId }: WorkspacesDashboardProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [list, setList] = useState<Workspace[]>(workspaces)

  if (!isAgency) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-sm text-slate-500 mt-1">Colabore em equipe nos seus links</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3">
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Workspaces disponíveis no plano{' '}
            <span className="font-medium text-foreground">Agência</span>.
          </p>
          <Button variant="outline" size="sm" className="ml-auto shrink-0" asChild>
            <a href="/pricing">Ver planos</a>
          </Button>
        </div>
      </div>
    )
  }

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao criar workspace.'); return }
      setList((prev) => [data, ...prev])
      setName('')
      setShowForm(false)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-sm text-slate-500 mt-1">Colabore em equipe nos seus links</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Plus className="w-4 h-4" />
            Novo Workspace
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-sm font-medium">Nome do workspace</p>
            <Input
              placeholder="Ex: Agência X, Time de Marketing..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreate} disabled={loading}>
                {loading ? 'Criando...' : 'Criar'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setError(null) }}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhum workspace ainda. Crie um para começar a colaborar.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((ws) => {
            const myRole = ws.members.find((m) => m.userId === userId)?.role ?? 'VIEWER'
            return (
              <Card
                key={ws.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboard/workspaces/${ws.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{ws.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{ROLE_LABELS[myRole]}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {ws.members.length} {ws.members.length === 1 ? 'membro' : 'membros'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Link2 className="h-3.5 w-3.5" />
                    {ws._count.links} {ws._count.links === 1 ? 'link' : 'links'}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}