'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QrCode, Download, Loader2 } from 'lucide-react'

interface QRCodeButtonProps {
  linkId: string
  slug: string
}

export function QRCodeButton({ linkId, slug }: QRCodeButtonProps) {
  const [open, setOpen] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleOpen = async () => {
    setOpen(true)
    if (qrCode) return // já carregou, não busca de novo

    setLoading(true)
    try {
      const res = await fetch(`/api/links/${linkId}/qrcode`)
      const data = await res.json()
      setQrCode(data.qrCode)
    } catch {
      console.error('Erro ao gerar QR Code')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrCode) return
    const a = document.createElement('a')
    a.href = qrCode
    a.download = `qrcode-${slug}.png`
    a.click()
  }

  return (
    <>
      <Button size="default" variant="ghost" onClick={handleOpen}>
        <QrCode className="w-5 h-5" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Code — /{slug}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center w-[300px] h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
            ) : qrCode ? (
              <>
                <img
                  src={qrCode}
                  alt={`QR Code para /${slug}`}
                  width={300}
                  height={300}
                  className="rounded-lg border"
                />
                <Button
                  onClick={handleDownload}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar QR Code
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-500">Erro ao gerar QR Code</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}