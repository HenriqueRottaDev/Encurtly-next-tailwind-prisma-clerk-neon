'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  slug: string
}

export function CopyButton({ slug }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button size="default" variant="ghost" onClick={handleCopy} aria-label="Copiar link">
      {copied ? (
        <Check className="w-5 h-5 text-green-500" data-testid="copy-success-icon" />
      ) : (
        <Copy className="w-5 h-5" />
      )}
    </Button>
  )
}