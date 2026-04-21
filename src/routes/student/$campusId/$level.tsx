import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toast } from 'react-hot-toast'
import { Send, ThumbsUp, Radio, CalendarClock, MonitorPlay } from 'lucide-react'

export const Route = createFileRoute('/student/$campusId/$level')({
  component: StudentView,
  head: ({ params }) => ({
    meta: [
      { title: `Q&A Session — Rhema BTC` },
      { name: 'description', content: `Live Q&A for ${params.campusId} campus, ${params.level.replace('-', ' ')}.` },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})

function StudentView() {
  const { campusId, level } = Route.useParams()

  const [studentUuid, setStudentUuid] = useState<string>('')
  const [studentName, setStudentName] = useState<string | null>(null)
  const [hasPromptedName, setHasPromptedName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let uuid = localStorage.getItem('classroom-qa-uuid')
    if (!uuid) {
      uuid =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15)
      localStorage.setItem('classroom-qa-uuid', uuid)
    }
    setStudentUuid(uuid)

    const storedName = localStorage.getItem('classroom-qa-name')
    if (storedName !== null) {
      setStudentName(storedName === 'null' ? null : storedName)
      setHasPromptedName(true)
    }
  }, [])

  const saveName = (name: string | null) => {
    setStudentName(name)
    localStorage.setItem('classroom-qa-name', name === null ? 'null' : name)
    setHasPromptedName(true)
  }

  const latestSession = useQuery(api.sessions.getLatestSession, {
    campusId,
    level,
  })
  const questions = useQuery(
    api.questions.getSessionQuestions,
    latestSession?._id ? { sessionId: latestSession._id } : 'skip',
  )
  const submitQuestion = useMutation(api.questions.submitQuestion)
  const upvoteQuestion = useMutation(api.questions.upvoteQuestion)

  // — Name prompt screen —
  if (!hasPromptedName) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            What should we call you?
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            You can stay anonymous if you prefer.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nameInput.trim())
                  saveName(nameInput.trim())
              }}
            />
            <button
              onClick={() => saveName(nameInput.trim() || null)}
              disabled={!nameInput.trim()}
              className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
            <button
              onClick={() => saveName(null)}
              className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
            >
              Stay anonymous
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (latestSession === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400 animate-pulse">Loading session…</p>
      </div>
    )
  }

  if (latestSession === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
            <Radio className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            No session active
          </h3>
          <p className="text-sm text-gray-400">
            Your instructor hasn't opened questions yet.
          </p>
        </div>
      </div>
    )
  }

  const isOpen = latestSession.isOpen && latestSession.closeAt > Date.now()
  const myQuestion = questions?.find((q: any) => q.submittedBy === studentUuid)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim() || !isOpen || isSubmitting) return

    setIsSubmitting(true)
    try {
      await submitQuestion({
        sessionId: latestSession._id,
        campusId,
        level,
        text: questionText.trim(),
        authorName: studentName,
        submittedBy: studentUuid,
      })
      setQuestionText('')
      toast.success('Question submitted!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit question')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvote = async (
    questionId: any,
    isAuthor: boolean,
    alreadyVoted: boolean,
  ) => {
    if (isAuthor || alreadyVoted || !isOpen) return
    try {
      await upvoteQuestion({ questionId, voterUuid: studentUuid })
    } catch (err: any) {
      toast.error(err.message || 'Failed to upvote')
    }
  }

  const sortedQuestions = questions
    ? [...questions].sort(
        (a: any, b: any) =>
          (b.votes || 0) - (a.votes || 0) || b.createdAt - a.createdAt,
      )
    : []

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {latestSession.topic}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {latestSession.instructor}
              </p>
            </div>
            {isOpen ? (
              <div className="flex items-center gap-2 shrink-0 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-semibold text-green-700">
                  Open · <Countdown targetDate={latestSession.closeAt} />
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-gray-400" />
                <span className="text-xs font-semibold text-gray-500">
                  Closed
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <CalendarClock size={12} />
            <span>
              {new Date(latestSession.classDates[0]).toLocaleDateString(
                undefined,
                {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                },
              )}{' '}
              &amp;{' '}
              {new Date(latestSession.classDates[1]).toLocaleDateString(
                undefined,
                {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                },
              )}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-5 space-y-5">
        {/* Question form */}
        {isOpen && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            {myQuestion ? (
              <div>
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3">
                  Your question
                </span>
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {myQuestion.text}
                </p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {myQuestion.authorName || 'Anonymous'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <ThumbsUp size={12} /> {myQuestion.votes || 0}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ask a question
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Type your question…"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-300"
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">
                    Posting as{' '}
                    <span className="text-gray-600 font-medium">
                      {studentName || 'Anonymous'}
                    </span>
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting || !questionText.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
                        Submitting
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Submit
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Questions list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Questions</h2>
            <span className="text-xs text-gray-400">
              {sortedQuestions.length} total
            </span>
          </div>

          {sortedQuestions.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <Radio className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No questions yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedQuestions.map((q: any) => {
                const isAuthor = q.submittedBy === studentUuid
                const alreadyVoted = q.votedBy?.includes(studentUuid)
                const canVote = !isAuthor && !alreadyVoted && isOpen

                return (
                  <div
                    key={q._id}
                    className={`bg-white border rounded-2xl p-4 flex gap-3 transition-all ${
                      q.isProjected
                        ? 'border-blue-200 ring-1 ring-blue-100'
                        : isAuthor
                          ? 'border-gray-200 ring-1 ring-gray-100'
                          : 'border-gray-200'
                    }`}
                  >
                    {/* Upvote */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          handleUpvote(q._id, isAuthor, alreadyVoted)
                        }
                        disabled={!canVote}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                          alreadyVoted && !isAuthor
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : canVote
                              ? 'border-gray-200 text-gray-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
                              : 'border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        <ThumbsUp
                          size={14}
                          className={
                            alreadyVoted && !isAuthor ? 'fill-blue-500' : ''
                          }
                        />
                      </button>
                      <span
                        className={`text-xs font-bold ${alreadyVoted && !isAuthor ? 'text-blue-600' : 'text-gray-400'}`}
                      >
                        {q.votes || 0}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {q.isProjected && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2">
                          <MonitorPlay size={10} className="animate-pulse" />{' '}
                          Projected
                        </span>
                      )}
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {q.text}
                      </p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-xs text-gray-400">
                          {q.authorName || 'Anonymous'}
                          {isAuthor && (
                            <span className="ml-1.5 text-gray-400">(you)</span>
                          )}
                        </span>
                        <span className="text-xs text-gray-300">
                          {new Date(q.createdAt).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Countdown({ targetDate }: { targetDate: number }) {
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, targetDate - Date.now()),
  )

  useEffect(() => {
    const calc = () => Math.max(0, targetDate - Date.now())
    setTimeLeft(calc())
    if (calc() <= 0) return
    const interval = setInterval(() => {
      const r = calc()
      setTimeLeft(r)
      if (r <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (timeLeft <= 0) return <span>closing</span>

  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const format =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, '0')}`
      : `${seconds}s`

  const color =
    timeLeft < 30000
      ? 'text-red-600'
      : timeLeft < 120000
        ? 'text-amber-600'
        : 'text-green-700'

  return <span className={`font-mono ${color}`}>{format}</span>
}
