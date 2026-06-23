'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { CreateLinkForm } from './create-link-form'
import { LinkCard } from './link-card'
import { PaginationControls } from '@/components/ui/pagination-controls'
import { LinkWithClickCount, PaginatedLinks } from '@/lib/repositories/link.repository'

interface LinksDashboardProps {
  initialData: PaginatedLinks
  isPro: boolean
}

export function LinksDashboard({ initialData, isPro }: LinksDashboardProps) {
  const [showForm, setShowForm] = useState(false)
  const [data, setData] = useState<PaginatedLinks>(initialData)
  const [page, setPage] = useState(initialData.page)
  const [perPage, setPerPage] = useState(initialData.perPage)
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const fetchLinks = useCallback(async (p: number, pp: number) => {
    setLoading(true)
    setSelectedIds(new Set())
    try {
      const res = await fetch(`/api/links?page=${p}&perPage=${pp}`)
      const json = await res.json()
      if (res.ok) setData(json)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (page === initialData.page && perPage === initialData.perPage) return
    fetchLinks(page, perPage)
  }, [page, perPage, fetchLinks, initialData.page, initialData.perPage])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedIds.size === data.links.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.links.map((l) => l.id)))
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`Deletar ${selectedIds.size} link(s)? Esta ação não pode ser desfeita.`)) return

    setDeleting(true)
    try {
      const res = await fetch('/api/links/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      if (res.ok) {
        await fetchLinks(page, perPage)
      }
    } finally {
      setDeleting(false)
    }
  }

  const allSelected = data.links.length > 0 && selectedIds.size === data.links.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meus Links</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie e acompanhe seus links encurtados
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Link
        </Button>
      </div>

      {showForm && <CreateLinkForm onClose={() => { setShowForm(false); fetchLinks(page, perPage) }} />}

      {/* Barra de seleção */}
      {data.links.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAll}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
          </button>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {deleting ? 'Deletando...' : `Deletar ${selectedIds.size} selecionado(s)`}
            </Button>
          )}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: perPage > 10 ? 5 : 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : data.links.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhum link encontrado.
        </p>
      ) : (
        <div className="space-y-3">
          {data.links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              selected={selectedIds.has(link.id)}
              onToggle={toggleSelect}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {data.totalPages > 1 && (
        <PaginationControls
          page={page}
          perPage={perPage}
          total={data.total}
          totalPages={data.totalPages}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}
    </div>
  )
}