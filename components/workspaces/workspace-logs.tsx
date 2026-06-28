'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Link2, Pencil, Trash2, UserPlus, UserMinus,
  Shield, ScrollText, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Log {
  id: string
  action: string
  description: string
  createdAt: string
  user: { id: string; name: string | null; email: string }
}

interface WorkspaceLogsProps {
  workspaceId: string
  isAgency: boolean
  isAdmin: boolean
}

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'link.created': {
    label: 'Link criado',
    icon: <Link2 className="h-3.5 w-3.5" />,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  'link.updated': {
    label: 'Link editado',
    icon: <Pencil className="h-3.5 w-3.5" />,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  'link.deleted': {
    label: 'Link deletado',
    icon: <Trash2 className="h-3.5 w-3.5" />,
    color: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  'member.invited': {
    label: 'Convite gerado',
    icon: <UserPlus className="h-3.5 w-3.5" />,
    color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  },
  'member.removed': {
    label: 'Membro removido',
    icon: <UserMinus className="h-3.5 w-3.5" />,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  'member.role_changed': {
    label: 'Role alterado',
    icon: <Shield className="h-3.5 w-3.5" />,
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function WorkspaceLogs({ workspaceId, isAgency, isAdmin }: WorkspaceLogsProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAgency || !isAdmin) { setLoading(false); return }
    fetch(`/api/workspaces/${workspaceId}/logs`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setLogs(data) })
      .finally(() => setLoading(false))
  }, [workspaceId, isAgency, isAdmin])

  if (!isAdmin) return null

  if (!isAgency) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Logs de atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-3">
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Logs de atividade disponíveis apenas no plano{' '}
              <span className="font-medium text-foreground">Agência</span>.
            </p>
            <Button variant="outline" size="sm" className="ml-auto shrink-0" asChild>
              <a href="/pricing">Ver planos</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Logs de atividade
          </CardTitle>
          <span className="text-xs text-muted-foreground">Últimos 30 dias</span>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma atividade registrada nos últimos 30 dias.
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-3">
            <div className="space-y-2">
              {logs.map((log) => {
                const meta = ACTION_META[log.action] ?? {
                  label: log.action,
                  icon: <ScrollText className="h-3.5 w-3.5" />,
                  color: 'bg-muted text-muted-foreground border-muted',
                }
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    {/* Ícone da ação */}
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${meta.color}`}>
                      {meta.icon}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 h-4 ${meta.color}`}
                        >
                          {meta.label}
                        </Badge>
                        <span className="text-xs font-medium truncate">
                          {log.user.name || log.user.email}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {log.description}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}