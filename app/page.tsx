'use client'

import { useEffect, useState } from 'react'
import { ClimbLogger } from '@/components/ClimbLogger'
import { ClimbHistory } from '@/components/ClimbHistory'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('ascent_auth')
      if (auth === 'ok') {
        setIsAuthed(true)
      } else {
        router.push('/login')
      }
    }
    setLoading(false)
  }

  const handleSignOut = () => {
    localStorage.removeItem('ascent_auth')
    setIsAuthed(false)
    router.push('/login')
  }

  if (loading) {
    return <div className="text-center text-gray-400 pt-8">Loading...</div>
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Ascent 🧗</h1>
          <p className="text-gray-400 mb-6">Track Owen's climbing progress</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ascent 🧗</h1>
            <p className="text-gray-400 text-sm">Owen's Climbing Tracker</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <ClimbLogger />
          </div>
          <div>
            <ClimbHistory />
          </div>
        </div>
      </main>
    </div>
  )
}
