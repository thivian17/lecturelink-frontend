import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { LectureWithSummary, DashboardStats } from '@/lib/types'

async function getDashboardData(userId: string) {
  const supabase = await createServerSupabaseClient()
  
  // Get all lectures for stats
  const { data: lectures } = await supabase
    .from('lectures')
    .select(`
      id,
      title,
      status,
      duration,
      created_at,
      lecture_summaries (
        key_concepts
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const allLectures = (lectures || []) as LectureWithSummary[]
  
  // Calculate stats
  const stats: DashboardStats = {
    totalLectures: allLectures.length,
    completedLectures: allLectures.filter(l => l.status === 'completed').length,
    totalDurationMinutes: Math.round(
      allLectures.reduce((acc, l) => acc + (l.duration || 0), 0) / 60
    ),
    totalConcepts: allLectures.reduce((acc, l) => {
      const summary = Array.isArray(l.lecture_summaries) 
        ? l.lecture_summaries[0] 
        : l.lecture_summaries
      return acc + (summary?.key_concepts?.length || 0)
    }, 0),
  }

  // Get recent lectures (limit 5)
  const recentLectures = allLectures.slice(0, 5)

  return { stats, recentLectures }
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '—'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}h ${remainingMins}m`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
          Completed
        </span>
      )
    case 'processing':
      return (
        <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
          Processing
        </span>
      )
    case 'failed':
      return (
        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
          Failed
        </span>
      )
    default:
      return null
  }
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { stats, recentLectures } = await getDashboardData(user.id)
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-gray-600">
          Here&apos;s an overview of your lecture library
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Lectures</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLectures}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedLectures}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Duration</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDurationMinutes}m</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Concepts Extracted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalConcepts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Lectures */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Lectures</h2>
                {recentLectures.length > 0 && (
                  <Link 
                    href="/dashboard" 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View all →
                  </Link>
                )}
              </div>
            </div>
            
            {recentLectures.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📭</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lectures yet</h3>
                <p className="text-gray-500 mb-6">
                  Upload your first lecture to get started
                </p>
                <Link
                  href="/record"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  <span>📤</span>
                  Upload Lecture
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentLectures.map((lecture) => {
                  const summary = Array.isArray(lecture.lecture_summaries) 
                    ? lecture.lecture_summaries[0] 
                    : lecture.lecture_summaries
                  const conceptCount = summary?.key_concepts?.length || 0
                  
                  return (
                    <Link
                      key={lecture.id}
                      href={`/lecture/${lecture.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition"
                    >
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🎙️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {lecture.title}
                          </h3>
                          {getStatusBadge(lecture.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{formatDate(lecture.created_at)}</span>
                          <span>•</span>
                          <span>{formatDuration(lecture.duration)}</span>
                          {conceptCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{conceptCount} concepts</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📤</span>
              <h3 className="text-xl font-bold">New Lecture</h3>
            </div>
            <p className="text-blue-100 mb-6 text-sm">
              Upload audio and slides to create a new AI-processed lecture
            </p>
            <Link
              href="/record"
              className="block w-full py-3 bg-white text-blue-600 rounded-xl font-semibold text-center hover:bg-blue-50 transition"
            >
              Upload Files
            </Link>
          </div>

          {/* Tips Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>💡</span> Quick Tips
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Upload both audio and slides for best results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Supported audio: MP3, WAV, M4A, WEBM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Supported slides: PDF, PPTX</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Processing takes 5-10 minutes per hour of audio</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
