'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pause, Play, Trash2, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

interface LinkActionsProps {
  linkId: string
  disabled: boolean
}

export function LinkActions({ linkId, disabled }: LinkActionsProps) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/links/${linkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: !disabled }),
      })
      if (!res.ok) throw new Error('Erro ao atualizar link')
      return res.json()
    },
    onSuccess: () => router.refresh(),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/links/${linkId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Erro ao deletar link')
      return res.json()
    },
    onSuccess: () => {
      setConfirmDelete(false)
      router.refresh()
    },
  })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
          >
            {disabled ? (
              <><Play className="w-4 h-4 mr-2 text-green-500" /> Ativar link</>
            ) : (
              <><Pause className="w-4 h-4 mr-2 text-orange-500" /> Pausar link</>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmDelete(true)}
            className="text-red-500 focus:text-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deletar link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de confirmação de delete */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deletar link?</DialogTitle>
            <DialogDescription>
              Essa ação não pode ser desfeita. O link e todos os cliques
              registrados serão removidos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Deletar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}