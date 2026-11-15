"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = DayPickerProps

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col gap-3",
        month: "space-y-3",
        month_caption: "flex items-center justify-center pt-1 pb-1 relative",
        caption_label: "text-sm font-medium text-foreground",
        nav: "flex items-center justify-between absolute inset-x-0 top-0.5",
        button_previous:
          "h-7 w-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-overlay/5 hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
        button_next:
          "h-7 w-7 flex items-center justify-center rounded-md text-fg-muted hover:bg-overlay/5 hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-8 text-[11px] font-medium text-fg-subtle uppercase",
        weeks: "",
        week: "flex w-full mt-1",
        day: "h-8 w-8 text-center text-sm p-0 relative",
        day_button: "h-8 w-8 rounded-md text-fg-strong hover:bg-overlay/5 cursor-pointer",
        today: "[&>button]:border [&>button]:border-brand/50",
        selected: "[&>button]:bg-brand [&>button]:text-brand-foreground [&>button]:font-semibold [&>button]:hover:bg-brand",
        range_start: "[&>button]:bg-brand [&>button]:text-brand-foreground [&>button]:font-semibold",
        range_end: "[&>button]:bg-brand [&>button]:text-brand-foreground [&>button]:font-semibold",
        range_middle: "bg-brand/15 [&>button]:bg-transparent [&>button]:text-brand-text [&>button]:hover:bg-brand/20",
        outside: "[&>button]:text-fg-subtle",
        disabled: "[&>button]:text-fg-subtle/50 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === "left" ? <ChevronLeft className="h-4 w-4" {...chevronProps} /> : <ChevronRight className="h-4 w-4" {...chevronProps} />,
      }}
      {...props}
    />
  )
}

export { Calendar }
