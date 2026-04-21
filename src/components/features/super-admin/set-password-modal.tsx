import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../ui/dialog'

interface AdminInfo {
  campusId: string
  campusName: string
  level: string
}

interface SetPasswordModalProps {
  adminInfo: AdminInfo | null
  onClose: () => void
  onSave: (campusId: string, level: string, password: string) => Promise<void>
}

export function SetPasswordModal({ adminInfo, onClose, onSave }: SetPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOpen = adminInfo !== null

  const handleClose = () => {
    setPassword('')
    setConfirm('')
    setShowPassword(false)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminInfo) return
    if (password.trim().length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setIsSaving(true)
    setError(null)
    try {
      await onSave(adminInfo.campusId, adminInfo.level, password.trim())
      handleClose()
    } catch {
      setError('Failed to save password.')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10'

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>
            Set password{adminInfo ? ` — ${adminInfo.level.replace('-', ' ')}` : ''}
          </DialogTitle>
          <DialogDescription>
            Admin password for{' '}
            <span className="font-medium text-gray-900">
              {adminInfo?.campusName ?? 'this campus'}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {[
            { id: 'pwd', label: 'New password', value: password, onChange: setPassword },
            { id: 'confirm', label: 'Confirm password', value: confirm, onChange: setConfirm },
          ].map(({ id, label, value, onChange }) => (
            <div key={id}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  disabled={isSaving}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || password.trim().length < 6 || password !== confirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving…' : 'Save password'}
          </button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
