// Mirrors GET /search's response shape exactly (services/searchService.js) —
// capped at 5 results per section server-side.
export type SearchReportResult = {
  id: string
  fileAName: string | null
  fileBName: string | null
  runDate: string
}

export type SearchMemberResult = {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
  }
}

export type SearchResults = {
  reports: SearchReportResult[]
  members: SearchMemberResult[]
}
