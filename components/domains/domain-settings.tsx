'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FieldTooltip } from '@/components/ui/field-tooltip'
import { Globe, Trash2, RefreshCw, CheckCircle2, Clock, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface DomainData {
    id: string
    domain: string
    verified: boolean
    verification?: { type: string; domain: string; value: string; reason: string }[]
}

interface DomainSettingsProps {
    apiPath: string
    plan: 'FREE' | 'BASIC' | 'PRO' | 'AGENCY' 
    maxDomains: number
}

export function DomainSettings({ apiPath, plan, maxDomains }: DomainSettingsProps) {
    const [domain, setDomain] = useState<DomainData | null>(null)
    const [loading, setLoading] = useState(true)
    const [input, setInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [checking, setChecking] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetch(apiPath)
            .then((r) => r.json())
            .then((data) => { if (data?.id) setDomain(data) })
            .finally(() => setLoading(false))
    }, [apiPath])

    async function handleAdd() {
        if (!input.trim()) return
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(apiPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: input.trim() }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error ?? 'Erro ao adicionar domínio.'); return }
            setDomain(data)
            setInput('')
            toast.success('Domínio adicionado. Configure o CNAME para verificar.')
        } finally {
            setSaving(false)
        }
    }

    async function handleCheck() {
        if (!domain) return
        setChecking(true)
        try {
            const res = await fetch(apiPath)
            const data = await res.json()
            if (data?.verified) {
                setDomain((prev) => prev ? { ...prev, verified: true } : prev)
                toast.success('Domínio verificado com sucesso!')
            } else {
                toast.info('Domínio ainda não verificado. Aguarde a propagação do DNS.')
            }
        } catch {
            toast.error('Erro ao verificar domínio.')
        } finally {
            setChecking(false)
        }
    }

    async function handleDelete() {
        if (!domain) return
        setConfirmDelete(false)
        try {
            const res = await fetch(`/api/domains/${domain.id}`, { method: 'DELETE' })
            if (res.ok) {
                setDomain(null)
                toast.success('Domínio removido.')
            } else {
                const data = await res.json()
                toast.error(data.error ?? 'Erro ao remover domínio.')
            }
        } catch {
            toast.error('Erro de conexão.')
        }
    }

    async function copyToClipboard(text: string) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>

    return (
        <>
            <ConfirmDialog
                open={confirmDelete}
                title="Remover domínio"
                description={`Tem certeza que deseja remover o domínio "${domain?.domain}"? Os links voltarão a usar o domínio padrão.`}
                confirmLabel="Remover"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
            />

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Domínio personalizado
                        <FieldTooltip content={
                            plan === 'PRO'
                                ? 'Plano Pro permite 1 domínio personalizado vinculado à sua conta. Todos os seus links usarão esse domínio.'
                                : 'Plano Agência permite até 10 domínios, um por workspace. Cada workspace pode ter seu próprio domínio.'
                        } />
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!domain ? (
                        <div className="space-y-3">
                            <div>
                                <label className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    Seu domínio
                                    <FieldTooltip content="Digite apenas o domínio, sem https://. Ex: links.suaagencia.com.br" />
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="links.suaagencia.com.br"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    />
                                    <Button onClick={handleAdd} disabled={saving || !input.trim()}>
                                        {saving ? 'Adicionando...' : 'Adicionar'}
                                    </Button>
                                </div>
                            </div>
                            {error && (
                                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Status do domínio */}
                            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                                <div className="flex items-center gap-3">
                                    {domain.verified ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-yellow-500 shrink-0" />
                                    )}
                                    <div>
                                        <p className="text-sm font-medium">{domain.domain}</p>
                                        <Badge
                                            variant={domain.verified ? 'default' : 'secondary'}
                                            className={`text-xs mt-0.5 ${domain.verified ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-0' : ''}`}
                                        >
                                            {domain.verified ? 'Verificado' : 'Aguardando verificação'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!domain.verified && (
                                        <Button variant="outline" size="sm" onClick={handleCheck} disabled={checking} className="gap-1.5">
                                            <RefreshCw className={`h-3.5 w-3.5 ${checking ? 'animate-spin' : ''}`} />
                                            Verificar
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => setConfirmDelete(true)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Instruções de configuração */}
                            {!domain.verified && (
                                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                                    <p className="text-sm font-medium">Configure o DNS do seu domínio</p>
                                    <p className="text-xs text-muted-foreground">
                                        Adicione o seguinte registro CNAME no painel do seu provedor de DNS:
                                    </p>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground">
                                            <span>Tipo</span>
                                            <span>Nome</span>
                                            <span>Valor</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 items-center rounded-md bg-background border px-3 py-2">
                                            <span className="text-xs font-mono">CNAME</span>
                                            <span className="text-xs font-mono truncate">{domain.domain.split('.').slice(0, -2).join('.') || '@'}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs font-mono truncate">cname.vercel-dns.com</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 shrink-0"
                                                    onClick={() => copyToClipboard('cname.vercel-dns.com')}
                                                >
                                                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Após configurar, aguarde até 24h para propagação do DNS e clique em "Verificar".
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}