'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CtaOverlayProps {
    slug: string
    ctaEnabled: boolean
    ctaTitle: string | null
    ctaMessage: string | null
    ctaButtonText: string | null
    ctaButtonUrl: string | null
}

export function CtaOverlay({
    slug,
    ctaEnabled,
    ctaTitle,
    ctaMessage,
    ctaButtonText,
    ctaButtonUrl,
}: CtaOverlayProps) {
    const [loading, setLoading] = useState(false)

    const handleContinue = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/links/${slug}/track-redirect`, {
                method: 'POST',
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto px-4 text-center space-y-6">
            {ctaEnabled && ctaTitle ? (
                <div className="space-y-3">
                    <h1 className="text-xl font-semibold">{ctaTitle}</h1>
                    {ctaMessage && (
                        <p className="text-sm text-muted-foreground">{ctaMessage}</p>
                    )}
                    {ctaButtonUrl && ctaButtonText && (
                        <a
                            href={ctaButtonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm text-primary underline"
                        >
                            {ctaButtonText}
                        </a>
                    )}
                </div>
            ) : (
                // Placeholder até a conta AdSense ser aprovada
                <div className="border border-dashed border-border rounded-lg py-12 px-4 text-sm text-muted-foreground">
                    Espaço reservado para anúncio
                </div>
            )}

            <Button onClick={handleContinue} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continuar'}
            </Button>
        </div>
    )
}