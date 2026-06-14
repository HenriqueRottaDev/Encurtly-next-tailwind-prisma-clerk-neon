'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ClicksChartProps {
  data: { date: string; count: number }[]
}

export function ClicksChart({ data }: ClicksChartProps) {
  // Formata a data para exibição (DD/MM)
  const formattedData = data.map(item => ({
    ...item,
    label: new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
  }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Sem dados de cliques nos últimos 30 dias
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          stroke="var(--muted-foreground)"
          fontSize={12}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={12}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '13px',
          }}
          labelFormatter={(label) => `Dia ${label}`}
          formatter={(value) => [`${value} cliques`, '']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ fill: 'var(--primary)', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}