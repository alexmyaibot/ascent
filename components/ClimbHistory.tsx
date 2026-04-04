'use client'

import { useState, useEffect } from 'react'
import { supabase, type Climb } from '@/lib/supabase'

export function ClimbHistory() {
  const [climbs, setClimbs] = useState<Climb[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClimbs()
  }, [])

  const fetchClimbs = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Please log in to view your climbs')
        setLoading(false)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('climbs')
        .select('*')
        .eq('user_id', user.id)
        .order('date_climbed', { ascending: false })

      if (fetchError) throw fetchError
      setClimbs(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch climbs')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading climbs...</div>
  }

  if (error) {
    return <div className="p-3 bg-red-900 text-red-200 rounded-lg">{error}</div>
  }

  if (climbs.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No climbs logged yet. Start timing your first climb! 🧗</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Climb History</h2>
      <div className="space-y-3">
        {climbs.map((climb) => (
          <div key={climb.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-white">{climb.route_name}</h3>
                <p className="text-sm text-gray-400">{formatDate(climb.date_climbed)}</p>
              </div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {climb.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-mono font-bold text-green-400">
                {formatTime(climb.time_seconds)}
              </span>
              {climb.notes && (
                <p className="text-sm text-gray-300 italic">{climb.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={fetchClimbs}
        className="mt-4 w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg"
      >
        🔄 Refresh
      </button>
    </div>
  )
}
