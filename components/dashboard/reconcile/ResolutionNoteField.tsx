// Matches the note column's VarChar(1000) on report_row_resolutions.
export const RESOLUTION_NOTE_MAX_LENGTH = 1000

type ResolutionNoteFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export default function ResolutionNoteField({ value, onChange, placeholder }: ResolutionNoteFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 mb-2">
        <label className="text-xs text-slate-400">Note (required)</label>
        <span className="text-xs text-slate-500">
          {value.length}/{RESOLUTION_NOTE_MAX_LENGTH}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={RESOLUTION_NOTE_MAX_LENGTH}
        className="w-full resize-none rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
      />
    </div>
  )
}
