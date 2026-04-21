import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { QRCodeSVG } from 'qrcode.react'

export const Route = createFileRoute('/projector/$campusId/$level')({
  component: ProjectorView,
})

function ProjectorView() {
  const { campusId, level } = Route.useParams()
  // Retrieve view query param (e.g. ?view=qr)
  const search: any = Route.useSearch()

  const currentSession = useQuery(api.sessions.getLatestSession, {
    campusId,
    level,
  })

  const [currentIndex, setCurrentIndex] = useState(0)

  // Grab all questions for the current session
  const questionsRaw = useQuery(
    api.questions.getSessionQuestions,
    currentSession?._id ? { sessionId: currentSession._id } : 'skip',
  )

  // Only project top questions based on votes
  const questions = questionsRaw
    ? [...questionsRaw].sort(
        (a: any, b: any) =>
          (b.votes || 0) - (a.votes || 0) || b.createdAt - a.createdAt,
      )
    : []

  // Ensure index stays in bounds if questions update live
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      setCurrentIndex(questions.length - 1)
    }
  }, [questions.length, currentIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentIndex((curr) => Math.min(curr + 1, questions.length - 1))
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((curr) => Math.max(curr - 1, 0))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [questions.length])

  // Simple loading state
  if (currentSession === undefined || questionsRaw === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-2xl animate-pulse">
          Loading projection...
        </p>
      </div>
    )
  }

  // If no session
  if (currentSession === null) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center text-white">
        <h1 className="text-6xl font-bold mb-4 opacity-30">
          No Active Session
        </h1>
        <p className="text-2xl text-gray-500">
          Waiting for the admin to start a new Q&A session.
        </p>
      </div>
    )
  }

  const studentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/student/${campusId}/${level}`
      : ''

  // If QR mode was requested via query params or if there are no questions yet
  if (search?.view === 'qr' || questions.length === 0) {
    return (
      <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden select-none">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="z-10 flex flex-col items-center w-full h-full justify-center">
          {/* Topic Header (Reduced prominence) */}
          <div className="text-center mb-6 lg:mb-8 shrink-0">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white/90 mb-1 lg:mb-2 tracking-tight">
              {currentSession.topic}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-blue-300/80 font-medium">
              {currentSession.instructor}
            </p>
          </div>

          <div
            id="qr-download-target"
            className="flex flex-col items-center bg-white p-8 md:p-10 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl transform transition-transform hover:scale-[1.01] duration-500 w-full max-w-4xl border-4 border-white/10 shrink min-h-0"
          >
            {/* Main Header (Increased prominence) */}
            <div className="text-center mb-6 lg:mb-8 shrink-0">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                Got a question?
              </h1>
              <p className="text-xl md:text-2xl text-gray-500 font-medium">
                Scan the code below to ask your questions
              </p>
            </div>

            {/* QR code centered block */}
            <div className="bg-gray-50 p-4 lg:p-6 rounded-3xl border-2 border-gray-100 shadow-inner flex items-center justify-center shrink min-h-0 overflow-hidden mb-6 lg:mb-8">
              <QRCodeSVG
                value={studentUrl}
                size={400}
                className="w-full h-full max-h-[30vh] lg:max-h-[50vh] object-contain aspect-square"
              />
            </div>
          </div>
          {/* Link block below QR */}
          <div className=" mt-4 px-6 py-4 lg:py-6 rounded-3xl w-full text-center shrink-0 overflow-hidden">
            <p className="text-sm md:text-base text-gray-500 font-extrabold uppercase tracking-widest mb-1.5 font-sans">
              Or visit
            </p>
            {/* whitespace-nowrap prevents wrapping, ensures text size is the constraint */}
            <p className="text-2xl md:text-3xl lg:text-[2.5rem] text-white font-mono font-bold whitespace-nowrap tracking-tight leading-none truncate px-4">
              {studentUrl.replace(/^https?:\/\//, '')}
            </p>
          </div>

          {questions.length > 0 && search?.view !== 'qr' && (
            <div className="flex items-center gap-3 text-white/60 animate-pulse mt-6 lg:mt-8 shrink-0 bg-black/20 px-6 py-3 rounded-full backdrop-blur-sm border border-white/10">
              <span className="text-xl font-medium tracking-wide">Press</span>
              <kbd className="px-3 py-1.5 bg-white/10 rounded-lg font-mono font-bold text-white border border-white/20">
                →
              </kbd>
              <span className="text-xl font-medium tracking-wide">
                to begin questions
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentQ = questions[currentIndex]

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col p-12 select-none">
      {/* Header Info */}
      <div className="flex items-start justify-between opacity-60">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {currentSession.topic}
          </h2>
          <p className="text-lg text-gray-400">{currentSession.instructor}</p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-mono text-white bg-gray-800 px-6 py-2 rounded-2xl">
            {currentIndex + 1} / {questions.length}
          </p>
        </div>
      </div>

      {/* Main Question Slide */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-16 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="w-full max-h-[65vh] overflow-y-auto px-8 pb-12 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center leading-relaxed tracking-tight wrap-break-word">
            "{currentQ.text}"
          </h1>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white font-bold text-2xl rounded-full">
            {currentQ.authorName
              ? currentQ.authorName.charAt(0).toUpperCase()
              : '?'}
          </div>
          <div className="text-left">
            <p className="text-3xl font-medium text-white">
              {currentQ.authorName || 'Anonymous'}
            </p>
            <p className="text-xl text-gray-400 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="text-blue-400">▲</span> {currentQ.votes || 0}
              </span>
              <span>·</span>
              <span>
                {new Date(currentQ.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center gap-3 pb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-16 bg-blue-500'
                : 'w-2 bg-gray-700 opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
