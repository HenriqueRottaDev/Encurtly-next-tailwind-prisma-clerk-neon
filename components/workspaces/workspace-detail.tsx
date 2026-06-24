'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Check, Trash2, Users, Shield, Link2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { CreateLinkForm } from '@/components/links/create-link-form'
import { LinkCard } from '@/components/links/link-card'
import { LinkWithClickCount } from '@/lib/repositories/link.repository'

import { DomainSettings } from '@/components/domains/domain-settings'

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

interface WorkspaceDetailProps {
  workspace: Workspace
  currentUserId: string
  currentUserRole: string
  initialLinks: LinkWithClickCount[]
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  VIEWER: 'Visualizador',
}

export function WorkspaceDetail({
  workspace,
  currentUserId,
  currentUserRole,
  initialLinks,
}: WorkspaceDetailProps) {
  const router = useRouter()
  const isAdmin = currentUserRole === 'ADMIN'
  const canEdit = currentUserRole === 'ADMIN' || currentUserRole === 'EDITOR'

  const [members, setMembers] = useState<Member[]>(workspace.members)
  const [links, setLinks] = useState<LinkWithClickCount[]>(initialLinks)
  const [showCreateLink, setShowCreateLink] = useState(false)
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('EDITOR')
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [inviteExpiry, setInviteExpiry] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [generatingInvite, setGeneratingInvite] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [confirmMember, setConfirmMember] = useState<Member | null>(null)
  const [confirmDeleteWorkspace, setConfirmDeleteWorkspace] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const originalAdminId = workspace.members[0].userId

  async function handleGenerateInvite() {
    setGeneratingInvite(true)
    setError(null)
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao gerar convite.'); return }
      setInviteUrl(data.inviteUrl)
      setInviteExpiry(new Date(data.expiresAt).toLocaleDateString('pt-BR'))
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setGeneratingInvite(false)
    }
  }

  async function handleCopyInvite() {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRemoveMember() {
    if (!confirmMember) return
    setDeletingMemberId(confirmMember.userId)
    setConfirmMember(null)
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: confirmMember.userId }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Não foi possível remover o membro.')
        return
      }
      setMembers((prev) => prev.filter((m) => m.userId !== confirmMember.userId))
      toast.success('Membro removido com sucesso.')
    } finally {
      setDeletingMemberId(null)
    }
  }

  async function handleUpdateRole(targetUserId: string, role: string) {
    const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, role }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Não foi possível alterar o role.')
      return
    }
    setMembers((prev) =>
      prev.map((m) => (m.userId === targetUserId ? { ...m, role } : m))
    )
    toast.success('Role atualizado.')
  }

  async function handleDeleteWorkspace() {
    setConfirmDeleteWorkspace(false)
    const res = await fetch(`/api/workspaces/${workspace.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/dashboard/workspaces')
    else toast.error('Erro ao deletar workspace.')
  }

  async function refreshLinks() {
    const res = await fetch(`/api/workspaces/${workspace.id}/links`)
    const data = await res.json()
    if (res.ok) setLinks(data)
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    setDeleting(true)
    try {
      const res = await fetch('/api/links/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      if (res.ok) {
        setSelectedIds(new Set())
        await refreshLinks()
        toast.success('Links deletados.')
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Modais de confirmação */}
      <ConfirmDialog
        open={!!confirmMember}
        title="Remover membro"
        description={`Tem certeza que deseja remover ${confirmMember?.user.name || confirmMember?.user.email} do workspace?`}
        confirmLabel="Remover"
        onConfirm={handleRemoveMember}
        onCancel={() => setConfirmMember(null)}
      />
      <ConfirmDialog
        open={confirmDeleteWorkspace}
        title="Deletar workspace"
        description={`Tem certeza que deseja deletar o workspace "${workspace.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Deletar"
        onConfirm={handleDeleteWorkspace}
        onCancel={() => setConfirmDeleteWorkspace(false)}
      />

      {/* Header */}
      <div>
        <Link
          href="/dashboard/workspaces"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Workspaces
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{workspace.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {members.length} {members.length === 1 ? 'membro' : 'membros'} · {links.length} {links.length === 1 ? 'link' : 'links'}
            </p>
          </div>
          {isAdmin && (
            <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteWorkspace(true)} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Deletar workspace
            </Button>
          )}
        </div>
      </div>

      {/* Links do workspace */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Links
          </h2>
          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => setShowCreateLink(!showCreateLink)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Novo link
            </Button>
          )}
        </div>

        {showCreateLink && (
          <CreateLinkForm
            workspaceId={workspace.id}
            onClose={() => { setShowCreateLink(false); refreshLinks() }}
          />
        )}

        {links.length > 0 && isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedIds.size === links.length) setSelectedIds(new Set())
                else setSelectedIds(new Set(links.map((l) => l.id)))
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {selectedIds.size === links.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
            {selectedIds.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={deleting} className="gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? 'Deletando...' : `Deletar ${selectedIds.size} selecionado(s)`}
              </Button>
            )}
          </div>
        )}

        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Nenhum link neste workspace ainda.</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                selected={selectedIds.has(link.id)}
                onToggle={isAdmin ? toggleSelect : () => { }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Convidar membro */}
      {isAdmin && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Convidar membro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                <SelectTrigger className="h-9 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="VIEWER">Visualizador</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleGenerateInvite} disabled={generatingInvite}>
                {generatingInvite ? 'Gerando...' : 'Gerar link de convite'}
              </Button>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}

            {inviteUrl && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                  <p className="text-xs text-muted-foreground truncate flex-1">{inviteUrl}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopyInvite}>
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Expira em {inviteExpiry}. Válido para um uso.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Membros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Membros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => {
            const isMe = member.userId === currentUserId
            const isOriginalAdmin = member.userId === originalAdminId
            const canChangeRole = isAdmin && !isMe && !(isOriginalAdmin && currentUserId !== originalAdminId)

            return (
              <div key={member.userId} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.user.name || member.user.email}
                    {isMe && <span className="text-xs text-muted-foreground ml-1">(você)</span>}
                    {isOriginalAdmin && <span className="text-xs text-violet-500 ml-1">(criador)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                </div>

                {canChangeRole ? (
                  <Select value={member.role} onValueChange={(v) => handleUpdateRole(member.userId, v)}>
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="VIEWER">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="text-xs">{ROLE_LABELS[member.role]}</Badge>
                )}

                {isAdmin && !isMe && !(isOriginalAdmin && currentUserId !== originalAdminId) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmMember(member)}
                    disabled={deletingMemberId === member.userId}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {isAdmin && (
        <DomainSettings
          apiPath={`/api/workspaces/${workspace.id}/domain`}
          plan="AGENCY"
          maxDomains={10}
        />
      )}
    </div>
  )
}