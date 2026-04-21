import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { ShieldAlert, ChevronRight, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: App, head: () => ({ meta: [{ title: 'Rhema BTC — Student Q&A' }, { name: 'description', content: 'Select your campus and level to join a live Q&A session.' }] }) })

function App() {
  const navigate = useNavigate()
  const campuses = useQuery(api.campuses.getCampuses)
  const [selectedCampus, setSelectedCampus] = useState<any>(null)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 mb-5">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path d="M4 6h14M4 10h10M4 14h7" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Rhema Bible Training Center
            </h1>
            <p className="text-gray-400 text-sm mt-1.5">Student Q&amp;A Portal</p>
          </div>

          {/* Card */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            {!campuses ? (
              <div className="p-8 text-center text-sm text-gray-400 animate-pulse">
                Loading campuses…
              </div>
            ) : campuses.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No campuses configured yet.
              </div>
            ) : !selectedCampus ? (
              <div>
                <div className="px-5 pt-5 pb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Select campus
                  </p>
                </div>
                <div className="divide-y divide-gray-100">
                  {campuses.map((campus: any) => (
                    <button
                      key={campus.id}
                      onClick={() => setSelectedCampus(campus)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group text-left"
                    >
                      <span className="font-medium text-gray-800 group-hover:text-gray-900">
                        {campus.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="px-5 pt-5 pb-3 flex items-center gap-3 border-b border-gray-100">
                  <button
                    onClick={() => setSelectedCampus(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      {selectedCampus.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Select your level</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {selectedCampus.levels?.map((level: string) => (
                    <button
                      key={level}
                      onClick={() => navigate({ to: `/student/${selectedCampus.id}/${level}` })}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50 transition-colors group text-left"
                    >
                      <span className="font-medium text-gray-800 group-hover:text-blue-700 capitalize">
                        {level.replace('-', ' ')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="pb-8 flex justify-center">
        <button
          onClick={() => navigate({ to: '/admin/login' })}
          className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-500 transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Admin Login
        </button>
      </footer>
    </div>
  )
}
