import * as XLSX from 'xlsx'

interface ExportSession {
  topic: string
}

interface ExportQuestion {
  text: string
  votes: number
  authorName: string | null
  createdAt: number
}

/** Strip characters that are illegal in filenames across OSes. */
function safeFilename(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '').trim()
  return cleaned.length > 0 ? cleaned : 'session'
}

/**
 * Generate and download an .xlsx file of a session's questions.
 * One row per question, sorted by votes (highest first), then newest.
 * Columns: Question, Votes, Author, Submitted.
 */
export function exportSessionToExcel(
  session: ExportSession,
  questions: ExportQuestion[],
): void {
  const sorted = [...questions].sort(
    (a, b) => (b.votes || 0) - (a.votes || 0) || b.createdAt - a.createdAt,
  )

  const rows = sorted.map((q) => ({
    Question: q.text,
    Votes: q.votes || 0,
    Author: q.authorName || 'Anonymous',
    Submitted: new Date(q.createdAt).toLocaleString(),
  }))

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: ['Question', 'Votes', 'Author', 'Submitted'],
  })
  worksheet['!cols'] = [{ wch: 70 }, { wch: 8 }, { wch: 22 }, { wch: 22 }]

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions')

  XLSX.writeFile(workbook, `${safeFilename(session.topic)}.xlsx`)
}
