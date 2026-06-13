'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMutation } from '@tanstack/react-query'

async function createLink(data: { url: string; slug?: string; title?: string }) {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erro ao criar link')
  }
  return res.json()
}

interface CreateLinkFormProps {
  onClose: () => void
}

export function CreateLinkForm({ onClose }: CreateLinkFormProps) {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')

  const mutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      router.refresh() // revalida os Server Components
      onClose()
      setUrl('')
      setSlug('')
      setTitle('')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    mutation.mutate({
      url,
      slug: slug || undefined,
      title: title || undefined,
    })
  }

  return (
    <Card className="border-violet-200 dark:border-violet-800">
      <CardHeader>
        <CardTitle className="text-base">Encurtar novo link</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="https://exemplo.com/url-muito-longa"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Input
              placeholder="Slug personalizado (opcional)"
              value={slug}
              onChange={e => setSlug(e.target.value)}
            />
            <Input
              placeholder="Título (opcional)"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          {mutation.error && (
            <p className="text-sm text-red-500">{mutation.error.message}</p>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {mutation.isPending ? 'Encurtando...' : 'Encurtar'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}