"use client"

import { NumericFormat } from "react-number-format"

// Amount and tolerance columns are Decimal(·, 4); more digits would be rounded away by Postgres
const AMOUNT_DECIMALS = 4

type MoneyInputProps = {
  value: string
  onValueChange: (value: string) => void
  allowNegative?: boolean
  decimals?: number
  max?: number
  placeholder?: string
  className?: string
  onBlur?: () => void
}

// Shows "1,250.50" while state and API keep the unformatted string "1250.5", so money never passes through a JS float
export function MoneyInput({
  value,
  onValueChange,
  allowNegative = false,
  decimals = AMOUNT_DECIMALS,
  max,
  placeholder,
  className,
  onBlur,
}: MoneyInputProps) {
  return (
    <NumericFormat
      value={value}
      valueIsNumericString
      thousandSeparator=","
      decimalScale={decimals}
      allowNegative={allowNegative}
      // Rejects the keystroke itself, so the field can never hold a value past max
      isAllowed={({ floatValue }) => max === undefined || floatValue === undefined || floatValue <= max}
      inputMode="decimal"
      placeholder={placeholder}
      className={className}
      onBlur={onBlur}
      // "prop" events fire when the parent resets value; only user edits should reach state
      onValueChange={(values, { source }) => {
        if (source === "event") onValueChange(values.value)
      }}
    />
  )
}
