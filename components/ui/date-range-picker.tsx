"use client"

import { useState } from "react"
import { CalendarDays, ChevronsUpDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useOrgFormat } from "@/lib/hooks/useOrgFormat"

type DateRangePickerProps = {
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

export function DateRangePicker({ value, onChange, placeholder = "Select date range", className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const { formatDate } = useOrgFormat()

  const label = value?.from ? (value.to ? `${formatDate(value.from)} - ${formatDate(value.to)}` : formatDate(value.from)) : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg-strong hover:bg-overlay/5",
          className
        )}
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
        {/* Only takes effect when className sizes the trigger: the label truncates and the chevron sits at the far right. */}
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange(range)
            if (range?.from && range?.to) setOpen(false)
          }}
          numberOfMonths={2}
        />
        {value?.from && (
          <div className="mt-2 flex justify-end border-t border-line pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
              className="cursor-pointer text-xs font-medium text-fg-muted hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
