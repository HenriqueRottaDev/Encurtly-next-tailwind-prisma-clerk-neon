'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateLinkForm } from './create-link-form'
import { LinkList } from './link-list'
import { LinkWithClickCount } from '@/lib/repositories/link.repository'

interface LinksDashboardProps {
  links: LinkWithClickCount[]
}

export function LinksDashboard({ links }: LinksDashboardProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meus Links</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie e acompanhe seus links encurtados
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Link
        </Button>
      </div>

      {showForm && (
        <CreateLinkForm onClose={() => setShowForm(false)} />
      )}

      <LinkList links={links} />
    </div>
  )
}