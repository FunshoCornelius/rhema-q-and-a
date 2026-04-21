import { useState } from 'react'
import { Plus } from 'lucide-react'

interface CreateCampusFormProps {
  onSubmit: (name: string) => Promise<void>
}

export function CreateCampusForm({ onSubmit }: CreateCampusFormProps) {
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isCreating) return
    setIsCreating(true)
    try {
      await onSubmit(name.trim())
      setName('')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg">
      <h2 className="text-sm font-bold text-gray-900 mb-1">Add New Campus</h2>
      <p className="text-xs text-gray-400 mb-4">
        New campuses default to Level 1 and Level 2.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="e.g. Abuja"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isCreating}
          required
          className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isCreating || !name.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={15} />
          {isCreating ? 'Creating…' : 'Create'}
        </button>
      </form>
    </div>
  )
}
