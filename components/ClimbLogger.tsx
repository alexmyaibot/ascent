'use client'

import { useState, useRef } from 'react'
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
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [locationMethod, setLocationMethod] = useState<'manual' | 'gps'>('manual')
  const [gpsLoading, setGpsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const presetLocations = ['Momentum Fort Union', 'Momentum Sandy', 'Home Wall', 'Red Rock', 'Smith Rock', 'Yosemite']

  const difficulties = ['5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5']

  const captureGPS = async () => {
    setGpsLoading(true)
    setError('')
    try {
      if (!navigator.geolocation) {
        setError('GPS not available on this device')
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setLocation(`📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
          setGpsLoading(false)
        },
        (err) => {
          setError('Could not access GPS: ' + err.message)
          setGpsLoading(false)
        }
      )
    } catch (err: any) {
      setError('GPS error: ' + err.message)
      setGpsLoading(false)
    }
  }

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      const newPhotos = Array.from(files)
      setPhotos([...photos, ...newPhotos])
      
      // Create previews
      newPhotos.forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          setPhotoPreviews(prev => [...prev, event.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index))
  }

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
      // Get current user (using localStorage for simple auth)
      const isAuthed = localStorage.getItem('ascent_auth') === 'ok'
      if (!isAuthed) {
        setError('You must be logged in')
        setLoading(false)
        return
      }

      // Use a fixed user_id since we're using simple auth
      const user_id = 'climb-logger-001'

      // Insert climb record
      const { data: climbData, error: insertError } = await supabase
        .from('climbs')
        .insert([
          {
            user_id: user_id,
            route_name: routeName || null,
            difficulty: difficulty,
            time_seconds: seconds,
            notes: notes || null,
            location: location || null,
            date_climbed: new Date().toISOString(),
          },
        ])
        .select()

      if (insertError) throw insertError

      // Upload photos if any
      if (photos.length > 0 && climbData && climbData.length > 0) {
        const climbId = climbData[0].id
        
        for (let i = 0; i < photos.length; i++) {
          const file = photos[i]
          const fileName = `${climbId}-${i}-${Date.now()}.jpg`
          
          const { error: uploadError } = await supabase.storage
            .from('climb-photos')
            .upload(`${climbId}/${fileName}`, file)
          
          if (uploadError) {
            console.error('Photo upload error:', uploadError)
            // Continue even if photo upload fails
          } else {
            // Store photo reference in database
            await supabase.from('climb_photos').insert([
              {
                climb_id: climbId,
                photo_url: `${climbId}/${fileName}`,
                uploaded_at: new Date().toISOString(),
              },
            ])
          }
        }
      }

      // Reset form
      setRouteName('')
      setNotes('')
      setDifficulty('5.6')
      setLocation('')
      setPhotos([])
      setPhotoPreviews([])
      reset()
      setSuccess(`✅ Logged ${routeName} in ${formatTime}${photos.length > 0 ? ` with ${photos.length} photo(s)` : ''}!`)

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
        <p className="text-gray-400 text-sm mb-2">Climbing Time</p>
        <p className="text-4xl sm:text-6xl font-bold text-emerald-400 font-mono mb-4">{formatTime}</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={isRunning ? stop : start}
            className={`px-4 py-2 rounded font-bold text-white transition-colors ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isRunning ? '⏸ Stop' : '▶ Start'}
          </button>
          <button
            onClick={reset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-bold text-white transition-colors"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Route Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Route Name
          </label>
          <input
            type="text"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="e.g., The Red Wall, Crimper Challenge..."
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none placeholder-slate-500"
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            📍 Location (optional)
          </label>
          
          {/* Quick Select */}
          <div className="flex flex-wrap gap-2 mb-3">
            {presetLocations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocation(loc)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  location === loc
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Manual Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Or type location..."
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none placeholder-slate-500 text-sm"
            />
            <button
              type="button"
              onClick={captureGPS}
              disabled={gpsLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-semibold text-sm transition-colors"
              title="Use phone GPS to capture location"
            >
              {gpsLoading ? '⏳' : '🛰️'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Quick select a gym or use GPS/manual entry</p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any tips?"
            className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-emerald-500 focus:outline-none placeholder-slate-500 resize-none h-24"
          />
        </div>

        {/* Photo Capture */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Route Photos (optional)
          </label>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              📸 Take Photo
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              📁 Upload Photo
            </button>
          </div>
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
            multiple
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoCapture}
            className="hidden"
            multiple
          />

          {/* Photo Previews */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400">{photos.length} photo(s) selected</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-900 border border-red-700 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-900 border border-emerald-700 text-emerald-200 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
        >
          {loading ? '🔄 Saving...' : '💾 Save Climb'}
        </button>
      </form>
    </div>
  )
}
