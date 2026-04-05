'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ClimbData {
  id: string
  route_name: string
  difficulty: string
  time_seconds: number
  fun_factor: number
  perceived_difficulty: number
  climb_type: string
  date_climbed: string
}

export default function DashboardPage() {
  const [climbs, setClimbs] = useState<ClimbData[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    // Check auth
    const isAuthed = localStorage.getItem('ascent_auth') === 'ok'
    if (!isAuthed) {
      router.push('/login')
      return
    }

    // Fetch climbs
    try {
      const { data, error } = await supabase
        .from('climbs')
        .select('*')
        .order('date_climbed', { ascending: false })

      if (error) throw error
      setClimbs(data || [])
    } catch (err) {
      console.error('Error fetching climbs:', err)
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for charts
  const climbsByGym = climbs.reduce((acc: Record<string, number>, climb) => {
    const gym = climb.route_name || 'Unknown'
    acc[gym] = (acc[gym] || 0) + 1
    return acc
  }, {})

  const gymChartData = Object.entries(climbsByGym).map(([gym, count]) => ({
    name: gym,
    climbs: count,
  }))

  const climbsByType = climbs.reduce((acc: Record<string, number>, climb) => {
    const type = climb.climb_type === 'topRope' ? 'Top Rope' : 'Boulder'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const typeChartData = Object.entries(climbsByType).map(([type, count]) => ({
    name: type,
    value: count,
  }))

  // Time series data (last 10 climbs)
  const timeSeriesData = climbs.slice(0, 10).reverse().map((climb, idx) => ({
    date: new Date(climb.date_climbed).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    time: Math.round(climb.time_seconds / 60),
    fun: climb.fun_factor,
    difficulty: climb.perceived_difficulty,
  }))

  // Stats
  const totalClimbs = climbs.length
  const totalTime = climbs.reduce((sum, c) => sum + c.time_seconds, 0)
  const avgFun =
    climbs.length > 0
      ? (climbs.reduce((sum, c) => sum + c.fun_factor, 0) / climbs.length).toFixed(1)
      : 0
  const avgDifficulty =
    climbs.length > 0
      ? (climbs.reduce((sum, c) => sum + c.perceived_difficulty, 0) / climbs.length).toFixed(1)
      : 0

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  if (loading) {
    return <div className="text-center text-gray-400 pt-8">Loading dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700 bg-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ascent Dashboard 📊</h1>
            <p className="text-gray-400 text-sm">Track your climbing progress</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            ← Back to Logger
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-gray-400 text-sm mb-1">Total Climbs</p>
            <p className="text-3xl font-bold text-emerald-400">{totalClimbs}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-gray-400 text-sm mb-1">Total Time</p>
            <p className="text-3xl font-bold text-blue-400">{Math.round(totalTime / 60)}m</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-gray-400 text-sm mb-1">Avg Fun Factor</p>
            <p className="text-3xl font-bold text-yellow-400">⭐ {avgFun}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-gray-400 text-sm mb-1">Avg Difficulty</p>
            <p className="text-3xl font-bold text-purple-400">💪 {avgDifficulty}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Time Series */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Climbing Time (Last 10)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="time" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Climb Type Pie */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-bold text-white mb-4">Climbs by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Fun & Difficulty Trend */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-4">Fun Factor & Difficulty Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fun"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Fun Factor"
                />
                <Line
                  type="monotone"
                  dataKey="difficulty"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Perceived Difficulty"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Climbs by Gym */}
          {gymChartData.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 lg:col-span-2">
              <h2 className="text-lg font-bold text-white mb-4">Climbs by Location</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gymChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="climbs" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
