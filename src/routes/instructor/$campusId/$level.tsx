import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useCountdown } from '../../../hooks/use-countdown'
import { Radio, MonitorPlay, ArrowUp } from 'lucide-react'

export const Route = createFileRoute('/instructor/$campusId/$level')({
  component: InstructorView,
  head: ({ params }) => ({
    meta: [
      { title: `Instructor View — Rhema BTC` },
      {
        name: 'description',
        content: `Live question feed for ${params.campusId} campus, ${params.level.replace('-', ' ')}.`,
      },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})

function InstructorView() {
  const { campusId, level } = Route.useParams()

  const session = useQuery(api.sessions.getLatestSession, { campusId, level })
  const questions = useQuery(
    api.questions.getSessionQuestions,
    session?._id ? { sessionId: session._id } : 'skip',
  )

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-sm text-gray-500 animate-pulse">Loading session…</p>
      </div>
    )
  }

  if (session === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-900 mb-5">
            <Radio className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-200 mb-1">
            No session active
          </h3>
          <p className="text-sm text-gray-500">
            Open a session from the admin dashboard to see questions here.
          </p>
        </div>
      </div>
    )
  }

  const isOpen = session.isOpen && session.closeAt > Date.now()

  const sortedQuestions = questions
    ? [...questions].sort(
        (a: any, b: any) =>
          (b.votes || 0) - (a.votes || 0) || b.createdAt - a.createdAt,
      )
    : []

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white truncate">
              {session.topic}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{session.instructor}</p>
          </div>
          {isOpen ? (
            <div className="shrink-0 flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3.5 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-sm font-semibold text-green-400">
                <CountdownLabel closeAt={session.closeAt} />
              </span>
            </div>
          ) : (
            <div className="shrink-0 flex items-center gap-2 bg-gray-800 border border-gray-700 px-3.5 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-gray-500" />
              <span className="text-sm font-semibold text-gray-400">Closed</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 mt-6">
        {sortedQuestions.length === 0 ? (
          <div className="border border-dashed border-gray-800 rounded-3xl p-16 text-center mt-10">
            <Radio className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-base text-gray-500">No questions yet.</p>
            <p className="text-sm text-gray-600 mt-1">
              They'll appear here in real time as students ask.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {sortedQuestions.map((q: any) => (
              <li
                key={q._id}
                className={`flex gap-4 sm:gap-5 rounded-3xl border p-5 sm:p-6 transition-colors ${
                  q.isProjected
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-gray-800 bg-gray-900/50'
                }`}
              >
                {/* Vote count */}
                <div className="shrink-0 flex flex-col items-center justify-center w-14 sm:w-16">
                  <ArrowUp
                    className="text-gray-500 mb-0.5"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <span className="text-2xl sm:text-3xl font-bold tabular-nums text-white leading-none">
                    {q.votes || 0}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-600 mt-1">
                    votes
                  </span>
                </div>

                {/* Question */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {q.isProjected && (
                    <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full mb-2">
                      <MonitorPlay size={12} className="animate-pulse" /> On
                      screen
                    </span>
                  )}
                  <p className="text-xl sm:text-2xl font-semibold text-gray-50 leading-snug wrap-break-word">
                    {q.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

function CountdownLabel({ closeAt }: { closeAt: number }) {
  const timeLeft = useCountdown(closeAt)
  if (timeLeft <= 0) return <span>closing…</span>
  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const formatted =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : `${seconds}s`
  return <span className="font-mono tabular-nums">{formatted} left</span>
}
