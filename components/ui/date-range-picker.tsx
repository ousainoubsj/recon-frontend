"use client"

import { useState } from "react"
import { CalendarDays, ChevronsUpDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/lib/format"

type DateRangePickerProps = {
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
  placeholder?: string
}

export function DateRangePicker({ value, onChange, placeholder = "Select date range" }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const label = value?.from ? (value.to ? `${formatDate(value.from)} - ${formatDate(value.to)}` : formatDate(value.from)) : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
        <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
        {label}
        <ChevronsUpDown className="h-3.5 w-3.5 text-slate-500" />
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
          <div className="mt-2 flex justify-end border-t border-[#232D47] pt-2">
            <button
              type="button"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
              className="cursor-pointer text-xs font-medium text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
