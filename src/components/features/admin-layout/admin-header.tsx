import { ShieldAlert, LogOut } from 'lucide-react'

interface AdminHeaderProps {
  campusId: string
  level: string
  onLogout: () => void
}

export function AdminHeader({ campusId, level, onLogout }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900 capitalize">
              {campusId} · Level {level.replace('level-', '')}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
