import { useState } from 'react'
import { getPreviousWeekend } from '../../../utils/date-helpers'

interface CreateSessionFormProps {
  isCreating: boolean
  onSubmit: (data: {
    topic: string
    instructor: string
    saturdayDate: string
    sundayDate: string
    closeTime: string
  }) => Promise<void>
}

export function CreateSessionForm({
  isCreating,
  onSubmit,
}: CreateSessionFormProps) {
  const defaultWeekend = getPreviousWeekend()
  const [newTopic, setNewTopic] = useState('')
  const [newInstructor, setNewInstructor] = useState('')
  const [saturdayDate, setSaturdayDate] = useState(defaultWeekend.saturday)
  const [sundayDate, setSundayDate] = useState(defaultWeekend.sunday)
  const [closeTime, setCloseTime] = useState('14:00')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTopic.trim() || !newInstructor.trim() || isCreating) return
    await onSubmit({
      topic: newTopic,
      instructor: newInstructor,
      saturdayDate,
      sundayDate,
      closeTime,
    })
    setNewTopic('')
    setNewInstructor('')
    setCloseTime('14:00')
    setSaturdayDate(defaultWeekend.saturday)
    setSundayDate(defaultWeekend.sunday)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl">
      <h3 className="text-base font-bold text-gray-900 mb-5">
        Open a new session
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Topic / Subject
          </label>
          <input
            type="text"
            required
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="e.g. Foundation of Faith"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Instructor
          </label>
          <input
            type="text"
            required
            value={newInstructor}
            onChange={(e) => setNewInstructor(e.target.value)}
            placeholder="e.g. Rev. Kenneth E. Hagin"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Saturday
            </label>
            <input
              type="date"
              required
              value={saturdayDate}
              onChange={(e) => setSaturdayDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              Sunday
            </label>
            <input
              type="date"
              required
              value={sundayDate}
              onChange={(e) => setSundayDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Close time (today)
          </label>
          <input
            type="time"
            required
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors ${
            isCreating
              ? 'bg-blue-400 cursor-not-allowed flex items-center justify-center gap-2'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isCreating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Opening...
            </>
          ) : (
            'Open session'
          )}
        </button>
      </form>
    </div>
  )
}
