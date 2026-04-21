import { MonitorPlay, Trash2, Download } from 'lucide-react'
import { toast } from 'react-hot-toast'
import PptxGenJS from 'pptxgenjs'

interface QuestionsListProps {
  questions: any[] | undefined
  session: any
  sortOrder: 'newest' | 'votes'
  setSortOrder: (order: 'newest' | 'votes') => void
  onProjectQuestion: (qid: any, sid: any) => void
  onDeleteQuestion: (id: any) => void
}

export function QuestionsList({
  questions,
  session,
  sortOrder,
  setSortOrder,
  onProjectQuestion,
  onDeleteQuestion,
}: QuestionsListProps) {
  const sortedQuestions = questions
    ? [...questions].sort((a: any, b: any) => {
        if (sortOrder === 'votes') {
          return (b.votes || 0) - (a.votes || 0) || b.createdAt - a.createdAt
        }
        return b.createdAt - a.createdAt
      })
    : []

  const totalVotes = questions
    ? questions.reduce((sum: number, q: any) => sum + (q.votes || 0), 0)
    : 0
  const topVotes =
    questions && questions.length > 0
      ? Math.max(...questions.map((q: any) => q.votes || 0))
      : 0

  const handleExportPPTX = () => {
    if (!questions || questions.length === 0) {
      toast.error('No questions to export')
      return
    }
    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_16x9'
    const exportQs = [...questions].sort(
      (a: any, b: any) => (b.votes || 0) - (a.votes || 0),
    )

    exportQs.forEach((q: any, i: number) => {
      const slide = pptx.addSlide()
      slide.background = { color: '1f2937' }

      slide.addText(`${i + 1} / ${exportQs.length}`, {
        x: '85%',
        y: '5%',
        w: '10%',
        color: '9ca3af',
        fontSize: 18,
        align: 'right',
      })

      slide.addText(`"${q.text}"`, {
        x: '10%',
        y: '25%',
        w: '80%',
        h: '40%',
        color: 'ffffff',
        fontSize: 44,
        align: 'center',
        bold: true,
      })

      slide.addText(`${q.authorName || 'Anonymous'}`, {
        x: '10%',
        y: '75%',
        w: '80%',
        color: 'ffffff',
        fontSize: 24,
        align: 'center',
      })
    })

    pptx.writeFile({ fileName: `Q&A-${session.topic}.pptx` })
    toast.success('PowerPoint downloaded!')
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 ">
        {[
          ['Questions', questions?.length || 0],
          ['Total Votes', totalVotes],
          ['Top Votes', topVotes],
        ].map(([label, val]) => (
          <div
            key={label as string}
            className="bg-white border border-gray-200 rounded-2xl p-4 text-center"
          >
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 my-4">
        <button
          onClick={handleExportPPTX}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          <Download size={16} /> Export Questions to PowerPoint
        </button>
        <button
          onClick={() => {
            const url = `/projector/${session.campusId}/${session.level}`
            window.open(url, '_blank', 'width=1200,height=800')
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          <MonitorPlay size={16} /> Open Web Projector
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Student Questions
        </h3>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {(['newest', 'votes'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setSortOrder(o)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sortOrder === o
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {o === 'newest' ? 'Newest' : 'Most Voted'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sortedQuestions.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-2xl">
            No questions yet.
          </div>
        ) : (
          sortedQuestions.map((q: any) => (
            <div
              key={q._id}
              className={`bg-white border rounded-2xl p-4 flex gap-3 transition-all ${
                q.isProjected
                  ? 'border-blue-200 ring-1 ring-blue-100'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col items-center justify-center shrink-0">
                <span className="text-lg font-bold text-gray-400 w-9 text-center">
                  {q.votes || 0}
                </span>
                <span className="text-xs text-gray-300">votes</span>
              </div>
              <div className="flex-1 min-w-0">
                {q.isProjected && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-2">
                    <MonitorPlay size={10} className="animate-pulse" />{' '}
                    Projected
                  </span>
                )}
                <p className="text-sm text-gray-900 leading-relaxed">
                  {q.text}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span className="font-medium text-gray-600">
                    {q.authorName || 'Anonymous'}
                  </span>
                  <span>·</span>
                  <span>
                    {new Date(q.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => onProjectQuestion(q._id, session._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <MonitorPlay size={13} /> Project
                </button>
                <button
                  onClick={() => onDeleteQuestion(q._id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
