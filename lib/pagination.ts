// Windowed page numbers (first, last, and a small range around the current
// page, with '...' gaps) — used by the Team page's Users/Invitations tables
// to render numbered pagination buttons without hardcoding a fixed page count.
export function getPageItems(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | '...')[] = [1]
  if (current > 3) items.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let p = start; p <= end; p++) items.push(p)
  if (current < total - 2) items.push('...')
  items.push(total)
  return items
}
