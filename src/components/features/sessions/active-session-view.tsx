import { useState } from 'react'
import { QrExportPanel } from './qr-export-panel'
import { QuestionsList } from '../questions/questions-list'
import { useCountdown } from '../../../hooks/use-countdown'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog'
import { toast } from 'react-hot-toast'

interface ActiveSessionViewProps {
  session: any
  questions: any[] | undefined
  onClose: () => void
  onProjectQuestion: (qid: any, sid: any) => void
  onProjectQR: () => void
  onDeleteQuestion: (args: { questionId: any }) => Promise<any>
  sortOrder: 'newest' | 'votes'
  setSortOrder: (order: 'newest' | 'votes') => void
  studentUrl: string
  instructorUrl: string
}

export function ActiveSessionView({
  session,
  questions,
  onClose,
  onProjectQuestion,
  onProjectQR,
  onDeleteQuestion,
  sortOrder,
  setSortOrder,
  studentUrl,
  instructorUrl,
}: ActiveSessionViewProps) {
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null)

  const timeLeft = useCountdown(session.closeAt)
  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`

  let timerColor = 'text-gray-900 border-gray-300'
  if (timeLeft < 30000) {
    timerColor = 'text-red-600 border-red-500 bg-red-50 font-bold animate-pulse'
  } else if (timeLeft < 120000) {
    timerColor = 'text-amber-600 border-amber-500 bg-amber-50 font-bold'
  }

  const handleDelete = async () => {
    if (!deleteQuestionId) return
    try {
      await onDeleteQuestion({ questionId: deleteQuestionId })
      toast.success('Question removed')
    } catch {
      toast.error('Failed to remove question')
    } finally {
      setDeleteQuestionId(null)
    }
  }

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Middle column — session info pinned, questions scroll */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-5">
        {/* Pinned: session header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{session.topic}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {session.instructor} · {session.classDates?.join(' & ')}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {session.isOpen ? (
              <>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                  </span>
                  Open
                </span>
                <button
                  onClick={onClose}
                  className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Close early
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                <span className="relative flex h-1.5 w-1.5 bg-gray-400 rounded-full" />
                Closed
              </span>
            )}
          </div>
        </div>

        {/* Scrollable: questions */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1">
          <QuestionsList
            questions={questions}
            session={session}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            onProjectQuestion={onProjectQuestion}
            onDeleteQuestion={(id) => setDeleteQuestionId(id)}
          />
        </div>
      </div>

      {/* Right column — always pinned */}
      <div className="w-72 shrink-0 flex flex-col gap-5 overflow-y-auto">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 text-center shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {session.isOpen ? 'Time Remaining' : 'Session Ended'}
          </p>
          <div className={`text-4xl font-mono py-3 px-4 rounded-xl border ${session.isOpen ? timerColor : 'text-gray-400 border-gray-200 bg-gray-50'}`}>
            {timeString}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {session.isOpen ? 'Closes at' : 'Closed at'}{' '}
            {new Date(session.closeAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>

        <QrExportPanel
          session={session}
          studentUrl={studentUrl}
          instructorUrl={instructorUrl}
          onProjectQR={onProjectQR}
        />
      </div>

      <Dialog
        open={!!deleteQuestionId}
        onClose={() => setDeleteQuestionId(null)}
      >
        <DialogHeader>
          <DialogTitle>Delete question?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={() => setDeleteQuestionId(null)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
