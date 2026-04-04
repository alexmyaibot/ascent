'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useTimer } from '@/hooks/useTimer'

export function ClimbLogger() {
  const { seconds, isRunning, start, stop, reset, formatTime } = useTimer()
  const [routeName, setRouteName] = useState('')
  const [difficulty, setDifficulty] = useState('5.6')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const difficulties = ['5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!routeName.trim()) {
      setError('Route name is required')
      return
    }

    if (seconds === 0) {
      setError('Please record some climbing time')
      return
    }

    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in')
        setLoading(false)
        return
      }

      // Insert climb record
      const { error: insertError } = await supabase.from('climbs').insert([
        {
          user_id: user.id,
          route_name: routeName,
          difficulty: difficulty,
          time_seconds: seconds,
          notes: notes || null,
          date_climbed: new Date().toISOString(),
        },
      ])

      if (insertError) throw insertError

      // Reset form
      setRouteName('')
      setNotes('')
      setDifficulty('5.6')
      reset()
      setSuccess(`✅ Logged ${routeName} in ${formatTime}!`)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to log climb')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Log a Climb</h2>

      {/* Timer Display */}
      <div className="bg-slate-900 rounded-lg p-6 sm:p-8 mb-6 text-center">
        <div className="text-5xl sm:text-6xl font-mono font-bold text-blue-400 mb-4">
          {formatTime}
        </div>
        <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
          <button
            onClick={isRunning ? stop : start}
            className={`flex-1 min-w-[120px] sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-bold text-white text-sm sm:text-base ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isRunning ? '⏸ Stop' : '▶ Start'}
          </button>
          <button
            onClick={reset}
            className="flex-1 min-w-[120px] sm:flex-none px-4 sm:px-6 py-3 rounded-lg font-bold text-white text-sm sm:text-base bg-gray-600 hover:bg-gray-700"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
            Route Name
          </label>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="e.g., The Flake, Dihedral Corner"
            className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white text-sm sm:text-base rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white text-sm sm:text-base rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any tips for next time?"
            className="w-full px-3 sm:px-4 py-2 bg-slate-700 text-white text-sm sm:text-base rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            rows={3}
          />
        </div>

        {error && <div className="p-3 bg-red-900 text-red-200 text-sm rounded-lg">{error}</div>}
        {success && <div className="p-3 bg-green-900 text-green-200 text-sm rounded-lg">{success}</div>}

        <button
          type="submit"
          disabled={loading || !routeName}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold text-sm sm:text-base rounded-lg"
        >
          {loading ? '🔄 Logging...' : '📝 Log Climb'}
        </button>
      </form>
    </div>
  )
}
