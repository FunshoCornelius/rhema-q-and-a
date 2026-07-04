import { Trash2, FileSpreadsheet, Loader2 } from 'lucide-react'

interface PastSessionsListProps {
  sessions: any[] | undefined
  selectedId?: string | null
  onSelect: (session: any) => void
  onDeleteSession: (id: any) => void
  onExport: (session: any) => void
  exportingId?: string | null
}

export function PastSessionsList({
  sessions,
  selectedId,
  onSelect,
  onDeleteSession,
  onExport,
  exportingId,
}: PastSessionsListProps) {
  if (sessions === undefined)
    return <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Loading…</div>

  if (sessions.length === 0)
    return <div className="p-8 text-center text-sm text-gray-400">No past sessions found.</div>

  const isCollapsed = !!selectedId

  // ── Collapsed: slim name-only list ────────────────────────────────────────
  if (isCollapsed) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {sessions.map((session: any) => {
          const isSelected = session._id === selectedId
          return (
            <div
              key={session._id}
              onClick={() => onSelect(session)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                {session.topic}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSession(session._id) }}
                className="ml-3 shrink-0 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Expanded: full table with clickable hint ───────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Past Sessions</span>
        <span className="text-xs text-gray-400 italic">Click a row to view details</span>
      </div>
      <table className="min-w-full divide-y divide-gray-100">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Topic</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Dates</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stats</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sessions.map((session: any) => (
            <tr
              key={session._id}
              onClick={() => onSelect(session)}
              className="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <td className="px-5 py-4">
                <p className="text-sm font-medium text-gray-900">{session.topic}</p>
                <p className="text-xs text-gray-400 mt-0.5">{session.instructor}</p>
              </td>
              <td className="px-5 py-4 text-xs text-gray-500">{session.classDates?.join(' & ')}</td>
              <td className="px-5 py-4 text-xs text-gray-500">
                {session.questionCount} Qs · {session.totalVotes} votes
              </td>
              <td className="px-5 py-4 text-right">
                <div className="inline-flex items-center gap-3">
                  <button
                    disabled={exportingId === session._id}
                    onClick={(e) => { e.stopPropagation(); onExport(session) }}
                    className="text-xs text-green-600 hover:text-green-700 inline-flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    title="Export questions to Excel"
                  >
                    {exportingId === session._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <FileSpreadsheet size={13} />
                    )}
                    {exportingId === session._id ? 'Exporting…' : 'Excel'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session._id) }}
                    className="text-xs text-red-500 hover:text-red-700 inline-flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
