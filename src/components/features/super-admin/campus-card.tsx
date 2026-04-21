import { KeyRound } from 'lucide-react'

interface CampusCardProps {
  campus: {
    _id: string
    id: string
    name: string
    levels: string[]
  }
  onSetPassword: (campusId: string, campusName: string, level: string) => void
}

export function CampusCard({ campus, onSetPassword }: CampusCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-bold text-gray-900">{campus.name}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">{campus.id}</p>
      </div>

      <div className="flex-1 divide-y divide-gray-50">
        {campus.levels.map((level) => (
          <div key={level} className="flex items-center justify-between px-5 py-3">
            <span className="text-xs font-medium text-gray-700 capitalize">
              {level.replace('-', ' ')}
            </span>
            <button
              onClick={() => onSetPassword(campus.id, campus.name, level)}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <KeyRound size={12} />
              Set password
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
