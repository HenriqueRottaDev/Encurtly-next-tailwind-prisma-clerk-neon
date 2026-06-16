'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'

interface DateTimePickerProps {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DateTimePicker({ value, onChange, placeholder }: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  // Horário no formato HH:mm para o input de hora
  const timeValue = value
    ? `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`
    : ''

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) {
      onChange(undefined)
      return
    }
    // Preserva o horário já selecionado (ou usa 23:59 como padrão)
    const newDate = new Date(date)
    if (value) {
      newDate.setHours(value.getHours(), value.getMinutes())
    } else {
      newDate.setHours(23, 59)
    }
    onChange(newDate)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const base = value ?? new Date()
    const newDate = new Date(base)
    newDate.setHours(hours || 0, minutes || 0)
    onChange(newDate)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value
            ? value.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : placeholder ?? 'Selecionar data e hora'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 space-y-3" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelectDate}
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Hora:</label>
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="flex-1"
            disabled={!value}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}