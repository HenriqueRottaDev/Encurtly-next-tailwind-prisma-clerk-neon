'use client'

import { useEffect, useState } from 'react'
import { Monitor, Smartphone, Globe } from 'lucide-react'

const chartData = [18, 32, 27, 45, 38, 62, 55, 78, 71, 89, 96, 112, 105, 134, 147]
const maxVal = 147
const W = 200
const H = 56
const pts = chartData.map((v, i) =>
  `${(i / (chartData.length - 1)) * W},${H - (v / maxVal) * H}`
)
const polylinePoints = pts.join(' ')
const polygonPoints = `0,${H} ${polylinePoints} ${W},${H}`

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 2000 / steps)
    return () => clearInterval(timer)
  }, [target])
  return <>{count.toLocaleString('pt-BR')}</>
}

export function HeroVisual() {
  return (
    <div className="relative w-full max-w-[400px] mx-auto select-none py-6 px-4">
      <div className="absolute inset-0 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />

      {/* Main card */}
      <div
        className="relative bg-card border border-border rounded-2xl p-5 shadow-2xl"
        style={{ animation: 'floatY 6s ease-in-out infinite' }}
      >
        {/* Link URL */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 bg-muted rounded-lg px-3 py-2 overflow-hidden">
            <span className="text-xs font-mono text-primary truncate block">
              encurtly.com.br/r/<strong>black-friday</strong>
            </span>
          </div>
          <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-md px-2 py-1 font-medium">
            Ativo
          </span>
        </div>

        {/* Stats + chart */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-3xl font-bold tabular-nums">
              <CountUp target={1247} />
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              cliques totais{' '}
              <span className="text-green-500 font-medium">↑ 34%</span>
            </p>
          </div>

          <svg width={W} height={H} className="opacity-90">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={polygonPoints} fill="url(#grad)" />
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex gap-0.5 text-sm">
              {'🇧🇷🇺🇸🇵🇹🇦🇷'.match(/\p{Emoji_Presentation}+/gu)?.map((f, i) => (
                <span key={i}>{f}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3" /> 67%
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> 33%
            </span>
          </div>
        </div>
      </div>

      {/* Floating badge — top right */}
      <div
        className="absolute top-2 -right-2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-lg text-xs flex items-center gap-2 whitespace-nowrap"
        style={{ animation: 'floatY 6s ease-in-out infinite 1.5s' }}
      >
        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="font-medium">+47 agora</span>
      </div>

      {/* Floating badge — bottom left */}
      <div
        className="absolute bottom-2 -left-2 bg-card border border-border rounded-xl px-3 py-1.5 shadow-lg text-xs flex items-center gap-2 whitespace-nowrap"
        style={{ animation: 'floatY 6s ease-in-out infinite 3s' }}
      >
        <span>🇧🇷</span>
        <span className="font-medium">Dados no Brasil</span>
      </div>

      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}