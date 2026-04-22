import { Link, useNavigate } from '@tanstack/react-router'
import { LayoutDashboard, Building2, LogOut } from 'lucide-react'
import { logoutSuperAdmin } from '../../../server/middleware'

interface SuperAdminLayoutProps {
  active: 'overview' | 'campuses'
  campuses?: Array<{ id: string; name: string }>
  children: React.ReactNode
}

const NAV = [
  { id: 'overview' as const, label: 'Overview', to: '/super-admin', icon: LayoutDashboard },
  { id: 'campuses' as const, label: 'Campuses & Admins', to: '/super-admin/campuses', icon: Building2 },
]

export function SuperAdminLayout({ active, campuses = [], children }: SuperAdminLayoutProps) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await logoutSuperAdmin()
    navigate({ to: '/super-admin/login' })
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">RhemaQA</p>
          <p className="text-xs text-gray-400 mt-0.5">Super Admin</p>
        </div>

        {/* Primary nav */}
        <nav className="flex flex-col gap-0.5 pt-3 px-2">
          {NAV.map(({ id, label, to, icon: Icon }) => (
            <Link
              key={id}
              to={to}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                active === id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {active === id && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-blue-600 rounded-r-full" />
              )}
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Campus list */}
        {campuses.length > 0 && (
          <div className="px-2 mt-5">
            <p className="px-3 pb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Campuses
            </p>
            {campuses.map((campus) => (
              <div
                key={campus.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-500"
              >
                <span className="truncate">{campus.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sign out */}
        <div className="mt-auto px-2 pb-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
