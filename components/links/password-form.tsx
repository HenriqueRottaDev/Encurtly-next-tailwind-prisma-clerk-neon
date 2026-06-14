'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

interface PasswordFormProps {
  slug: string
}

export function PasswordForm({ slug }: PasswordFormProps) {
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/links/${slug}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao verificar senha')
      }
      return res.json()
    },
    onSuccess: (data) => {
      window.location.href = data.url
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    mutation.mutate()
  }

  return (
    <Card className="w-full max-w-sm mx-4">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle>Link protegido</CardTitle>
        <CardDescription>
          Digite a senha para acessar este link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoFocus
          />
          {mutation.error && (
            <p className="text-sm text-destructive">{mutation.error.message}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            Acessar link
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}