import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { useQuery, useMutation, useConvex } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { toast } from 'react-hot-toast'
import { ChevronLeft } from 'lucide-react'
import { exportSessionToExcel } from '../../utils/export-excel'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog'
import { AdminHeader } from '../../components/features/admin-layout/admin-header'
import { ActiveSessionView } from '../../components/features/sessions/active-session-view'
import { CreateSessionForm } from '../../components/features/sessions/create-session-form'
import { PastSessionsList } from '../../components/features/sessions/past-sessions-list'
import { getAdminSession, logoutAdmin } from '../../server/middleware'

export const Route = createFileRoute('/admin/')({
  beforeLoad: async () => {
    const adminInfo = await getAdminSession()
    if (!adminInfo) throw redirect({ to: '/admin/login' })
    return { adminInfo }
  },
  head: () => ({ meta: [{ title: 'Admin Dashboard — Rhema BTC' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: AdminDashboard,
})

type Tab = 'latest' | 'create' | 'past'

// Fetches questions for whichever past session is selected
function usePastSessionQuestions(sessionId: string | null) {
  return useQuery(
    api.questions.getSessionQuestions,
    sessionId ? { sessionId: sessionId as Id<'sessions'> } : 'skip',
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const convex = useConvex()
  const context = Route.useRouteContext()
  const adminInfo = context?.adminInfo as { campusId: string; level: string; role: string } | undefined

  const latestSession = useQuery(
    api.sessions.getLatestSession,
    adminInfo ? { campusId: adminInfo.campusId, level: adminInfo.level } : 'skip',
  )
  const pastSessions = useQuery(
    api.sessions.getPastSessions,
    adminInfo ? { campusId: adminInfo.campusId, level: adminInfo.level } : 'skip',
  )
  const questions = useQuery(
    api.questions.getSessionQuestions,
    latestSession?._id ? { sessionId: latestSession._id } : 'skip',
  )

  const createSession = useMutation(api.sessions.createSession)
  const closeSession = useMutation(api.sessions.closeSession)
  const deleteSession = useMutation(api.sessions.deleteSession)
  const deleteQuestion = useMutation(api.questions.deleteQuestion)
  const toggleProjectQuestion = useMutation(api.questions.toggleProjectQuestion)

  const [activeTab, setActiveTab] = useState<Tab>('latest')
  const [sortOrder, setSortOrder] = useState<'newest' | 'votes'>('votes')
  const [isCreating, setIsCreating] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [deleteSessionId, setDeleteSessionId] = useState<Id<'sessions'> | null>(null)
  const [selectedPastSession, setSelectedPastSession] = useState<any>(null)
  const [pastSortOrder, setPastSortOrder] = useState<'newest' | 'votes'>('votes')
  const [exportingId, setExportingId] = useState<string | null>(null)

  const pastSessionQuestions = usePastSessionQuestions(selectedPastSession?._id ?? null)

  const projectorRef = useRef<Window | null>(null)

  const studentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/student/${adminInfo?.campusId}/${adminInfo?.level}`
      : ''

  const instructorUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/instructor/${adminInfo?.campusId}/${adminInfo?.level}`
      : ''

  const handleLogout = async () => {
    await logoutAdmin()
    navigate({ to: '/admin/login' })
  }

  const handleCreateSession = async (data: {
    topic: string
    instructor: string
    saturdayDate: string
    sundayDate: string
    closeTime: string
  }) => {
    if (!adminInfo) return
    setIsCreating(true)
    const closeAtDate = new Date()
    const [hours, minutes] = data.closeTime.split(':')
    closeAtDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    try {
      await createSession({
        campusId: adminInfo.campusId,
        level: adminInfo.level,
        topic: data.topic,
        instructor: data.instructor,
        classDates: [data.saturdayDate, data.sundayDate],
        closeAt: closeAtDate.getTime(),
      })
      toast.success('Session opened!')
      setActiveTab('latest')
    } catch (e: any) {
      toast.error(e.message || 'Failed to create session')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCloseSession = async () => {
    if (!latestSession) return
    try {
      await closeSession({ sessionId: latestSession._id })
      setIsCloseDialogOpen(false)
      toast.success('Session closed')
    } catch {
      toast.error('Failed to close session')
    }
  }

  const handleDeleteSession = async () => {
    if (!deleteSessionId) return
    try {
      await deleteSession({ sessionId: deleteSessionId })
      setDeleteSessionId(null)
      toast.success('Session deleted')
    } catch {
      toast.error('Failed to delete session')
    }
  }

  const openProjector = (queryStr = '') => {
    if (!adminInfo) return
    const url = `/projector/${adminInfo.campusId}/${adminInfo.level}${queryStr}`
    if (projectorRef.current && !projectorRef.current.closed) {
      projectorRef.current.location.href = url
      projectorRef.current.focus()
    } else {
      projectorRef.current = window.open(url, '_blank', 'width=1200,height=800')
    }
  }

  const handleExportSession = async (session: any) => {
    setExportingId(session._id)
    try {
      const sessionQuestions = await convex.query(
        api.questions.getSessionQuestions,
        { sessionId: session._id as Id<'sessions'> },
      )
      if (sessionQuestions.length === 0) {
        toast.error('No questions to export')
        return
      }
      exportSessionToExcel(session, sessionQuestions)
      toast.success('Excel exported')
    } catch {
      toast.error('Failed to export questions')
    } finally {
      setExportingId(null)
    }
  }

  const handleProjectQuestion = async (qid: any, sid: any) => {
    try {
      await toggleProjectQuestion({ questionId: qid, sessionId: sid })
      openProjector()
      toast.success('Projecting question…')
    } catch {
      toast.error('Failed to project question')
    }
  }

  if (!adminInfo) return null

  const tabs: { id: Tab; label: string }[] = [
    { id: 'latest', label: 'Latest Session' },
    { id: 'create', label: 'Create Session' },
    { id: 'past', label: 'Past Sessions' },
  ]

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <AdminHeader
        campusId={adminInfo.campusId}
        level={adminInfo.level}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-5">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content — fills remaining height, each panel scrolls independently */}
        <div className="flex-1 min-h-0">
        {activeTab === 'latest' && (
          <>
            {latestSession === undefined ? (
              <div className="p-8 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
            ) : latestSession === null ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No sessions yet.{' '}
                <button onClick={() => setActiveTab('create')} className="text-blue-600 hover:underline">
                  Create one →
                </button>
              </div>
            ) : (
              <div className="h-full">
                <ActiveSessionView
                session={latestSession}
                questions={questions}
                onClose={() => setIsCloseDialogOpen(true)}
                onProjectQuestion={handleProjectQuestion}
                onProjectQR={() => openProjector('?view=qr')}
                onDeleteQuestion={deleteQuestion}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                studentUrl={studentUrl}
                instructorUrl={instructorUrl}
              />
              </div>
            )}
          </>
        )}

        {activeTab === 'create' && (
          <div className="overflow-y-auto h-full">
            <CreateSessionForm isCreating={isCreating} onSubmit={handleCreateSession} />
          </div>
        )}

        {activeTab === 'past' && (
          <div className="flex gap-6 h-full min-h-0">
            {/* Session list — independent scroll */}
            <div className={`flex flex-col min-h-0 ${selectedPastSession ? 'w-64 shrink-0' : 'flex-1'}`}>
              <div className="flex-1 overflow-y-auto min-h-0">
                <PastSessionsList
                  sessions={pastSessions}
                  selectedId={selectedPastSession?._id}
                  onSelect={(s) => {
                    setSelectedPastSession((prev: any) => prev?._id === s._id ? null : s)
                  }}
                  onDeleteSession={(id) => {
                    if (selectedPastSession?._id === id) setSelectedPastSession(null)
                    setDeleteSessionId(id)
                  }}
                  onExport={handleExportSession}
                  exportingId={exportingId}
                />
              </div>
            </div>

            {/* Detail panel — questions scroll independently */}
            {selectedPastSession && (
              <div className="flex-1 min-w-0 flex flex-col min-h-0">
                <button
                  onClick={() => setSelectedPastSession(null)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors mb-4 shrink-0"
                >
                  <ChevronLeft size={14} /> Back to list
                </button>
                <div className="flex-1 min-h-0">
                  <ActiveSessionView
                    session={selectedPastSession}
                    questions={pastSessionQuestions}
                    onClose={() => {}}
                    onProjectQuestion={handleProjectQuestion}
                    onProjectQR={() => openProjector('?view=qr')}
                    onDeleteQuestion={deleteQuestion}
                    sortOrder={pastSortOrder}
                    setSortOrder={setPastSortOrder}
                    studentUrl={studentUrl}
                    instructorUrl={instructorUrl}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Close session dialog */}
      <Dialog open={isCloseDialogOpen} onClose={() => setIsCloseDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>Close session early?</DialogTitle>
          <DialogDescription>
            Students will no longer be able to submit questions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={() => setIsCloseDialogOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCloseSession}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
          >
            Close session
          </button>
        </DialogFooter>
      </Dialog>

      {/* Delete session dialog */}
      <Dialog open={!!deleteSessionId} onClose={() => setDeleteSessionId(null)}>
        <DialogHeader>
          <DialogTitle>Delete session?</DialogTitle>
          <DialogDescription>
            This will permanently delete the session and all its questions.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={() => setDeleteSessionId(null)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteSession}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
