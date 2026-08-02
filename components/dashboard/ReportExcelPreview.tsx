'use client'

import { useEffect, useMemo, useState } from 'react'
import JSZip from 'jszip'
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

type SheetImage = { sheetName: string; row: number; col: number; widthPx: number; heightPx: number; dataUrl: string }

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

// Embedded pictures (org logo, Reconcil wordmark) aren't part of SheetJS's
// cell model at all — read straight out of the underlying zip/OOXML parts
// instead. Every image our own generator (xlsxReport.js) places anchors at
// column 0, so rendering each one inside that row's first cell (rather than
// absolutely-positioned over the table, which would need pixel-exact column
// widths we don't have) is a safe simplification for files this preview is
// built to show — not a general-purpose xlsx image renderer.
function resolveZipPath(baseDir: string, relativeTarget: string): string {
  const stack: string[] = []
  for (const part of [...baseDir.split('/'), ...relativeTarget.split('/')]) {
    if (part === '' || part === '.') continue
    if (part === '..') stack.pop()
    else stack.push(part)
  }
  return stack.join('/')
}

async function extractImages(buffer: ArrayBuffer): Promise<SheetImage[]> {
  const zip = await JSZip.loadAsync(buffer)
  const parser = new DOMParser()
  const readXml = async (path: string) => {
    const file = zip.file(path)
    if (!file) return null
    return parser.parseFromString(await file.async('text'), 'application/xml')
  }
  const relTargets = (doc: Document) =>
    new Map(Array.from(doc.getElementsByTagName('Relationship')).map((el) => [el.getAttribute('Id')!, el.getAttribute('Target')!]))

  const workbookDoc = await readXml('xl/workbook.xml')
  const workbookRelsDoc = await readXml('xl/_rels/workbook.xml.rels')
  if (!workbookDoc || !workbookRelsDoc) return []
  const workbookRels = relTargets(workbookRelsDoc)

  const images: SheetImage[] = []

  for (const sheetEl of Array.from(workbookDoc.getElementsByTagName('sheet'))) {
    const sheetName = sheetEl.getAttribute('name')
    const rId = sheetEl.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id')
    const sheetTarget = rId ? workbookRels.get(rId) : undefined
    if (!sheetName || !sheetTarget) continue

    const sheetPath = resolveZipPath('xl', sheetTarget)
    const sheetDir = sheetPath.split('/').slice(0, -1).join('/')
    const sheetFile = sheetPath.split('/').pop()!
    const sheetRelsDoc = await readXml(`${sheetDir}/_rels/${sheetFile}.rels`)
    if (!sheetRelsDoc) continue

    const drawingRel = Array.from(sheetRelsDoc.getElementsByTagName('Relationship')).find((el) => el.getAttribute('Type')?.endsWith('/drawing'))
    if (!drawingRel) continue

    const drawingPath = resolveZipPath(sheetDir, drawingRel.getAttribute('Target')!)
    const drawingDoc = await readXml(drawingPath)
    if (!drawingDoc) continue
    const drawingDir = drawingPath.split('/').slice(0, -1).join('/')
    const drawingFile = drawingPath.split('/').pop()!
    const drawingRelsDoc = await readXml(`${drawingDir}/_rels/${drawingFile}.rels`)
    const drawingRels = drawingRelsDoc ? relTargets(drawingRelsDoc) : new Map<string, string>()

    const anchors = [
      ...Array.from(drawingDoc.getElementsByTagName('xdr:oneCellAnchor')),
      ...Array.from(drawingDoc.getElementsByTagName('xdr:twoCellAnchor')),
    ]

    for (const anchor of anchors) {
      const fromEl = anchor.getElementsByTagName('xdr:from')[0]
      const row = Number(fromEl?.getElementsByTagName('xdr:row')[0]?.textContent ?? 0)
      const col = Number(fromEl?.getElementsByTagName('xdr:col')[0]?.textContent ?? 0)
      const blipEl = anchor.getElementsByTagName('a:blip')[0]
      const embedId = blipEl?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed')
      const imgTarget = embedId ? drawingRels.get(embedId) : undefined
      if (!imgTarget) continue
      const imgFile = zip.file(resolveZipPath(drawingDir, imgTarget))
      if (!imgFile) continue

      const extEl = anchor.getElementsByTagName('xdr:ext')[0]
      const cx = Number(extEl?.getAttribute('cx') ?? 228600)
      const cy = Number(extEl?.getAttribute('cy') ?? 228600)
      const base64 = await imgFile.async('base64')
      const ext = imgTarget.split('.').pop() ?? 'png'

      images.push({ sheetName, row, col, widthPx: cx / 9525, heightPx: cy / 9525, dataUrl: `data:image/${ext};base64,${base64}` })
    }
  }

  return images
}

export default function ReportExcelPreview({ workbook, buffer }: { workbook: XLSX.WorkBook; buffer: ArrayBuffer }) {
  const [activeSheet, setActiveSheet] = useState(workbook.SheetNames[0])
  const [images, setImages] = useState<SheetImage[]>([])
  const rows = useMemo(() => buildRows(workbook.Sheets[activeSheet]), [workbook, activeSheet])

  useEffect(() => {
    let cancelled = false
    extractImages(buffer)
      .then((found) => {
        if (!cancelled) setImages(found)
      })
      .catch((err) => console.error('Failed to extract embedded images from xlsx preview', err))
    return () => {
      cancelled = true
    }
  }, [buffer])

  // Every image sits beside exactly 2 stacked-text rows in the generator's
  // own layout (org name + org type, or "Reconcil" + tagline) — the second
  // row is always reserved even when its text is empty (xlsxReport.js
  // advances the row cursor unconditionally), so this is a fixed span, not
  // something to infer from cell content.
  const IMAGE_ROW_SPAN = 2
  const coveredRows = useMemo(() => {
    const covered = new Set<number>()
    for (const img of images) {
      if (img.sheetName !== activeSheet || img.col !== 0) continue
      covered.add(img.row + 1)
    }
    return covered
  }, [images, activeSheet])

  const imageForRow = (rowIndex: number) => images.find((img) => img.sheetName === activeSheet && img.row === rowIndex && img.col === 0)

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
            {rows.map((row, ri) => {
              const image = imageForRow(ri)
              return (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    // Covered by an image's fixed 2-row span from the row
                    // above — same reason real merge-covered cells are
                    // omitted in buildRows: that <td>'s rowSpan already
                    // fills this grid position.
                    if (ci === 0 && coveredRows.has(ri)) return null
                    return (
                      <td
                        key={ci}
                        colSpan={cell.colSpan}
                        rowSpan={ci === 0 && image ? IMAGE_ROW_SPAN : cell.rowSpan}
                        className="border border-slate-200 px-2 py-1 whitespace-pre"
                        style={{
                          textAlign: cell.align,
                          verticalAlign: ci === 0 && image ? 'middle' : undefined,
                          backgroundColor: cell.bg,
                          color: cell.color ?? '#111827',
                          fontWeight: cell.bold ? 600 : 400,
                        }}
                      >
                        {ci === 0 && image ? (
                          // Native pixel size, not a percentage height — a
                          // percentage height here previously resolved
                          // against the scrollable preview pane instead of
                          // the table row, blowing the image up to fill the
                          // whole dialog.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image.dataUrl} alt="" width={image.widthPx} height={image.heightPx} />
                        ) : (
                          cell.value
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
