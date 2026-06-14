'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface BreakdownChartProps {
  data: { label: string; count: number }[]
}

export function BreakdownChart({ data }: BreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
        Sem dados ainda
      </div>
    )
  }

  // Limita aos top 5 e ordena
  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <ResponsiveContainer width="100%" height={Math.max(sorted.length * 40, 120)}>
      <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          stroke="var(--muted-foreground)"
          fontSize={12}
          width={90}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '13px',
          }}
          formatter={(value) => [`${value} cliques`, '']}
        />
        <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}