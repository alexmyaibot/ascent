'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Listen for OAuth callback
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/')
        }
      }
    )

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setError('Check your email for a confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`)
      setOauthLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Ascent 🧗</h1>
        <p className="text-gray-400 text-center mb-6">Track climbing progress</p>

        {/* Social Sign In */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={oauthLoading === 'google'}
            className="w-full px-4 py-3 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-slate-900 font-bold rounded-lg flex items-center justify-center gap-2"
          >
            {oauthLoading === 'google' ? '🔄' : '🔵'} Google
          </button>
          <button
            onClick={() => handleOAuthSignIn('apple')}
            disabled={oauthLoading === 'apple'}
            className="w-full px-4 py-3 bg-black hover:bg-gray-900 disabled:bg-gray-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
          >
            {oauthLoading === 'apple' ? '🔄' : '🍎'} Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-gray-400">or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && <div className="p-3 bg-red-900 text-red-200 rounded-lg text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold rounded-lg"
          >
            {loading ? '🔄' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
