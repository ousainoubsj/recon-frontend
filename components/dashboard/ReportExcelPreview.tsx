'use client'

import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

type Cell = {
  value: string
  align: 'left' | 'right'
  bg?: string
  color?: string
  bold?: boolean
  colSpan?: number
  rowSpan?: number
}

// Cell fonts aren't reliably readable back out of an xlsx file (SheetJS's
// free tier only round-trips fill colors, not font weight/color) — bold is
// inferred instead from bg contrast, and a plain white/no-fill row is styled
// as the default table look. Good enough for a readable preview; not a
// pixel-perfect copy of the generated file.
function contrastColor(rgb: string) {
  const r = parseInt(rgb.slice(0, 2), 16)
  const g = parseInt(rgb.slice(2, 4), 16)
  const b = parseInt(rgb.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#111827' : '#F9FAFB'
}

function buildRows(ws: XLSX.WorkSheet): Cell[][] {
  const ref = ws['!ref']
  if (!ref) return []
  const range = XLSX.utils.decode_range(ref)
  const merges = ws['!merges'] ?? []

  const covered = new Set<string>()
  const spanAt = new Map<string, { rowSpan: number; colSpan: number }>()
  for (const m of merges) {
    spanAt.set(`${m.s.r},${m.s.c}`, { rowSpan: m.e.r - m.s.r + 1, colSpan: m.e.c - m.s.c + 1 })
    for (let r = m.s.r; r <= m.e.r; r++) {
      for (let c = m.s.c; c <= m.e.c; c++) {
        if (r === m.s.r && c === m.s.c) continue
        covered.add(`${r},${c}`)
      }
    }
  }

  const rows: Cell[][] = []
  for (let r = range.s.r; r <= range.e.r; r++) {
    const rowCells: Cell[] = []
    for (let c = range.s.c; c <= range.e.c; c++) {
      const key = `${r},${c}`
      if (covered.has(key)) continue
      const addr = XLSX.utils.encode_cell({ r, c })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cell = ws[addr] as any
      const span = spanAt.get(key)
      const fillRgb = cell?.s?.patternType === 'solid' ? (cell.s.fgColor?.rgb as string | undefined) : undefined
      rowCells.push({
        value: cell?.w ?? (cell?.v != null ? String(cell.v) : ''),
        align: cell?.t === 'n' ? 'right' : 'left',
        bg: fillRgb ? `#${fillRgb}` : undefined,
        color: fillRgb ? contrastColor(fillRgb) : undefined,
        bold: !!fillRgb,
        colSpan: span?.colSpan,
        rowSpan: span?.rowSpan,
      })
    }
    rows.push(rowCells)
  }
  return rows
}

export default function ReportExcelPreview({ workbook }: { workbook: XLSX.WorkBook }) {
  const [activeSheet, setActiveSheet] = useState(workbook.SheetNames[0])
  const rows = useMemo(() => buildRows(workbook.Sheets[activeSheet]), [workbook, activeSheet])

  return (
    <div className="flex h-full flex-col">
      {workbook.SheetNames.length > 1 && (
        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-[#232D47] bg-[#0A1128] px-2 pt-2">
          {workbook.SheetNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setActiveSheet(name)}
              className={`shrink-0 cursor-pointer rounded-t-md px-3 py-1.5 text-xs font-medium transition-all duration-300 ${
                activeSheet === name ? 'bg-[#0E182D] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <table className="border-collapse text-[11px]">
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                    className="border border-slate-200 px-2 py-1 whitespace-pre"
                    style={{
                      textAlign: cell.align,
                      backgroundColor: cell.bg,
                      color: cell.color ?? '#111827',
                      fontWeight: cell.bold ? 600 : 400,
                    }}
                  >
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
