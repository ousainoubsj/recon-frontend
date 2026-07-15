'use client'

import * as React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type TruncateTooltipProps<T extends React.ElementType> = {
  as?: T
  children: React.ReactNode
  tooltip?: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<T>, 'children'>

export function TruncateTooltip<T extends React.ElementType = 'span'>({
  as,
  children,
  tooltip,
  ...props
}: TruncateTooltipProps<T>) {
  const Tag = (as ?? 'span') as React.ElementType

  return (
    <Tooltip>
      <TooltipTrigger render={<Tag {...props} />}>{children}</TooltipTrigger>
      <TooltipContent>{tooltip ?? children}</TooltipContent>
    </Tooltip>
  )
}
