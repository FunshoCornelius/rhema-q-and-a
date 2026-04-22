import { createFileRoute, redirect } from '@tanstack/react-router'
import { Building2, Radio, MessageCircle, ArrowUp } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { SuperAdminLayout } from '../../components/features/super-admin/super-admin-layout'
import { StatCard, CampusOverviewCard } from '../../components/features/super-admin/overview-cards'
import { getSuperAdminSession } from '../../server/middleware'

export const Route = createFileRoute('/super-admin/')({
  beforeLoad: async () => {
    const session = await getSuperAdminSession()
    if (!session) throw redirect({ to: '/super-admin/login' })
  },
  head: () => ({ meta: [{ title: 'Super Admin Overview — Rhema BTC' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: SuperAdminOverview,
})

function SuperAdminOverview() {
  const data = useQuery(api.dashboard.getDashboardStats)

  return (
    <SuperAdminLayout active="overview" campuses={data?.campuses}>
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-xl font-bold text-gray-900">Overview</h1>
        {/* <span className="text-xs bg-green-50 border border-green-200 text-green-600 font-medium px-2.5 py-1 rounded-full">
          Live
        </span> */}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard
          icon={<Building2 size={18} />}
          value={data?.stats.totalCampuses.toString() ?? '—'}
          label="Campuses"
        />
        <StatCard
          icon={<Radio size={18} />}
          value={data?.stats.activeSessions.toString() ?? '—'}
          label="Active Sessions"
        />
        <StatCard
          icon={<MessageCircle size={18} />}
          value={data?.stats.questionsToday.toString() ?? '—'}
          label="Questions Today"
        />
        <StatCard
          icon={<ArrowUp size={18} />}
          value={data?.stats.upvotesToday.toString() ?? '—'}
          label="Upvotes Today"
        />
      </div>

      {/* Campus grid */}
      {!data ? (
        <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
      ) : data.campuses.length === 0 ? (
        <p className="text-sm text-gray-400">No campuses yet.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.campuses.map((campus) => (
            <CampusOverviewCard
              key={campus.id}
              name={campus.name}
              levels={campus.levels.map((l) => ({
                ...l,
                status: l.status as 'open' | 'closed',
              }))}
            />
          ))}
        </div>
      )}
    </SuperAdminLayout>
  )
}
