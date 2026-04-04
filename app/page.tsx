'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ClimbLogger } from '@/components/ClimbLogger'
import { ClimbHistory } from '@/components/ClimbHistory'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user || null)
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  if (loading) {
    return <div className="text-center text-gray-400 pt-8">Loading...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Ascent 🧗</h1>
          <p className="text-gray-400 mb-6">Track Owen's climbing progress</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Ascent 🧗</h1>
            <p className="text-sm text-gray-400">Track Owen's climbing progress</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ClimbLogger />
        <ClimbHistory />
      </main>
    </div>
  )
}
