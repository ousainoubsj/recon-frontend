import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CORRECTION_FIELD_LABEL, CORRECTION_SIDE_LABEL } from '@/lib/corrections'
import type { CorrectionField, CorrectionSide } from '@/types/reports'

const TRIGGER_CLASS = 'h-10! w-full cursor-pointer justify-between border-[#232D47] bg-[#0A1128] text-sm text-slate-200'

type CorrectionTargetFieldsProps = {
  sides: CorrectionSide[]
  side: CorrectionSide
  onSideChange: (side: CorrectionSide) => void
  field: CorrectionField
  onFieldChange: (field: CorrectionField) => void
}

// Which file and which mapped field a correction overrides; the file is fixed when the row has one side.
export default function CorrectionTargetFields({ sides, side, onSideChange, field, onFieldChange }: CorrectionTargetFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">File</label>
        <Select
          value={side}
          onValueChange={(next) => next && onSideChange(next as CorrectionSide)}
          items={Object.fromEntries(sides.map((s) => [s, CORRECTION_SIDE_LABEL[s]]))}
          disabled={sides.length < 2}
        >
          <SelectTrigger className={TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sides.map((s) => (
              <SelectItem key={s} value={s}>
                {CORRECTION_SIDE_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">Field</label>
        <Select
          value={field}
          onValueChange={(next) => next && onFieldChange(next as CorrectionField)}
          items={CORRECTION_FIELD_LABEL}
        >
          <SelectTrigger className={TRIGGER_CLASS}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CORRECTION_FIELD_LABEL).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
