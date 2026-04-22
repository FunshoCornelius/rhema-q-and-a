import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { toast } from 'react-hot-toast'
import { SuperAdminLayout } from '../../components/features/super-admin/super-admin-layout'
import { CreateCampusForm } from '../../components/features/super-admin/create-campus-form'
import { CampusCard } from '../../components/features/super-admin/campus-card'
import { SetPasswordModal } from '../../components/features/super-admin/set-password-modal'
import { getSuperAdminSession } from '../../server/middleware'

export const Route = createFileRoute('/super-admin/campuses')({
  beforeLoad: async () => {
    const session = await getSuperAdminSession()
    if (!session) throw redirect({ to: '/super-admin/login' })
  },
  head: () => ({ meta: [{ title: 'Campuses & Admins — Rhema BTC' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: SuperAdminCampuses,
})

interface AdminTarget {
  campusId: string
  campusName: string
  level: string
}

function SuperAdminCampuses() {
  const campuses = useQuery(api.campuses.getCampuses) ?? []
  const createCampus = useMutation(api.campuses.createCampus)
  const setAdminPassword = useAction(api.adminActions.setAdminPassword)

  const [passwordTarget, setPasswordTarget] = useState<AdminTarget | null>(null)

  const handleCreateCampus = async (name: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    try {
      await createCampus({ id, name })
      toast.success(`Campus "${name}" created!`)
    } catch {
      toast.error('Failed to create campus. It may already exist.')
    }
  }

  const handleSavePassword = async (campusId: string, level: string, password: string) => {
    await setAdminPassword({ campusId, level, password })
    toast.success('Password saved!')
  }

  return (
    <SuperAdminLayout active="campuses" campuses={campuses}>
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-xl font-bold text-gray-900">Campuses & Admins</h1>
      </div>

      <div className="space-y-8">
        <CreateCampusForm onSubmit={handleCreateCampus} />

        {campuses.length === 0 ? (
          <p className="text-sm text-gray-400">No campuses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campuses.map((campus) => (
              <CampusCard
                key={campus._id}
                campus={campus}
                onSetPassword={(campusId, campusName, level) =>
                  setPasswordTarget({ campusId, campusName, level })
                }
              />
            ))}
          </div>
        )}
      </div>

      <SetPasswordModal
        adminInfo={passwordTarget}
        onClose={() => setPasswordTarget(null)}
        onSave={handleSavePassword}
      />
    </SuperAdminLayout>
  )
}
