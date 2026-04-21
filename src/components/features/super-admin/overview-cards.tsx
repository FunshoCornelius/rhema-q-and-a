import StatusDot from '../../StatusDot'

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  value: string
  label: string
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-2">
      <div className="text-gray-400">{icon}</div>
      <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

// ─── Campus Overview Card ─────────────────────────────────────────────────────

interface LevelRow {
  level: string
  status: 'open' | 'closed'
  questions: number
  topVotes: number
}

interface CampusOverviewCardProps {
  name: string
  levels: LevelRow[]
}

export function CampusOverviewCard({ name, levels }: CampusOverviewCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">{name}</p>
      </div>
      {levels.map((row, i) => (
        <div
          key={row.level}
          className={`px-4 py-3 flex items-center gap-3 ${i < levels.length - 1 ? 'border-b border-gray-50' : ''}`}
        >
          <StatusDot status={row.status} size={7} />
          <span className={`text-xs font-semibold w-10 shrink-0 ${row.status === 'open' ? 'text-green-600' : 'text-gray-400'}`}>
            {row.status === 'open' ? 'Open' : 'Closed'}
          </span>
          <span className="text-xs font-medium text-gray-700 w-14 shrink-0 capitalize">
            {row.level.replace('-', ' ')}
          </span>
          <span className="text-xs text-gray-400">{row.questions} questions</span>
          <span className="text-xs text-gray-400 ml-1">· top {row.topVotes}</span>
        </div>
      ))}
    </div>
  )
}
