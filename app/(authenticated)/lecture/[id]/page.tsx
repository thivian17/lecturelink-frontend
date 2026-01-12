'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Lecture, LectureSummary, KeyConcept, Definition, ActionItem } from '@/lib/types'

type TabType = 'report' | 'transcript'

export default function LecturePage() {
  const params = useParams()
  const router = useRouter()
  const lectureId = params.id as string
  const supabase = createClient()

  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [summary, setSummary] = useState<LectureSummary | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('report')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLecture()
  }, [lectureId])

  const fetchLecture = async () => {
    try {
      setLoading(true)
      
      // Fetch lecture
      const { data: lectureData, error: lectureError } = await supabase
        .from('lectures')
        .select('*')
        .eq('id', lectureId)
        .single()

      if (lectureError) throw lectureError
      setLecture(lectureData)

      // Fetch summary
      const { data: summaryData } = await supabase
        .from('lecture_summaries')
        .select('*')
        .eq('lecture_id', lectureId)
        .single()

      if (summaryData) {
        setSummary(summaryData)
      }
    } catch (err) {
      console.error('Error fetching lecture:', err)
      setError('Failed to load lecture')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '—'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Normalize key concepts (handle both naming conventions)
  const getConceptName = (concept: KeyConcept): string => {
    return concept.name || concept.concept || concept.term || 'Untitled Concept'
  }

  const getConceptExplanation = (concept: KeyConcept): string => {
    return concept.explanation || concept.definition || ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-500">Loading lecture...</p>
        </div>
      </div>
    )
  }

  if (error || !lecture) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Lecture not found'}
          </h2>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isProcessing = lecture.status === 'processing'

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
        >
          ← Back to Dashboard
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {lecture.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{formatDate(lecture.created_at)}</span>
              {lecture.duration && (
                <>
                  <span>•</span>
                  <span>{formatDuration(lecture.duration)}</span>
                </>
              )}
              {lecture.has_slides && (
                <>
                  <span>•</span>
                  <span className="text-green-600">📊 With Slides</span>
                </>
              )}
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            lecture.status === 'completed' 
              ? 'bg-green-50 text-green-700'
              : lecture.status === 'processing'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {lecture.status === 'completed' ? '✓ Completed' : 
             lecture.status === 'processing' ? '⏳ Processing' : '✕ Failed'}
          </span>
        </div>
      </div>

      {/* Processing Banner */}
      {isProcessing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="animate-spin text-2xl">⚙️</div>
            <div>
              <h3 className="font-semibold text-yellow-800">
                Processing in progress
              </h3>
              <p className="text-sm text-yellow-700">
                Your lecture is being transcribed and analyzed. This page will update automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('report')}
            className={`pb-3 border-b-2 font-medium text-sm transition ${
              activeTab === 'report'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            AI Report
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`pb-3 border-b-2 font-medium text-sm transition ${
              activeTab === 'transcript'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Transcript
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'report' && (
        <div className="space-y-8">
          {!summary && !isProcessing ? (
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No summary available
              </h3>
              <p className="text-gray-500">
                The AI summary for this lecture hasn&apos;t been generated yet.
              </p>
            </div>
          ) : summary && (
            <>
              {/* Key Concepts */}
              {summary.key_concepts && summary.key_concepts.length > 0 && (
                <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">💡</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Key Concepts</h2>
                      <p className="text-sm text-gray-500">
                        {summary.key_concepts.length} concepts identified
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {summary.key_concepts.map((concept: KeyConcept, index: number) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900">
                            {getConceptName(concept)}
                          </h3>
                          {concept.slide_reference && (
                            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                              Slide {concept.slide_reference}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mt-1 text-sm">
                          {getConceptExplanation(concept)}
                        </p>
                        {concept.importance && (
                          <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                            concept.importance === 'high' 
                              ? 'bg-red-100 text-red-700'
                              : concept.importance === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {concept.importance} importance
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Definitions */}
              {summary.definitions && summary.definitions.length > 0 && (
                <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📖</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Definitions</h2>
                      <p className="text-sm text-gray-500">
                        {summary.definitions.length} terms defined
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {summary.definitions.map((def: Definition, index: number) => (
                      <div
                        key={index}
                        className="border-l-4 border-purple-500 bg-purple-50 rounded-r-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900">{def.term}</h3>
                          {def.slide_reference && (
                            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                              Slide {def.slide_reference}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mt-1 text-sm">{def.definition}</p>
                        {def.context && (
                          <p className="text-gray-500 mt-2 text-xs italic">{def.context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Important Points */}
              {summary.important_points && summary.important_points.length > 0 && (
                <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">⭐</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Key Takeaways</h2>
                      <p className="text-sm text-gray-500">
                        {summary.important_points.length} important points
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {summary.important_points.map((point: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <span className="text-green-500 mt-1">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Action Items */}
              {summary.action_items && summary.action_items.length > 0 && (
                <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-xl">📝</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Action Items</h2>
                      <p className="text-sm text-gray-500">
                        {summary.action_items.length} tasks identified
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {summary.action_items.map((item: ActionItem, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg"
                      >
                        <input 
                          type="checkbox" 
                          className="mt-1 w-4 h-4 rounded border-gray-300"
                        />
                        <div>
                          <p className="text-gray-900">{item.item || item.task}</p>
                          {item.due_date && (
                            <p className="text-xs text-orange-600 mt-1">
                              Due: {item.due_date}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'transcript' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Full Transcript</h2>
              <p className="text-sm text-gray-500">Complete lecture transcription</p>
            </div>
          </div>
          
          {lecture.transcript ? (
            <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {lecture.transcript}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transcript available
              </h3>
              <p className="text-gray-500">
                {isProcessing 
                  ? 'Transcript is being generated...'
                  : 'The transcript for this lecture is not available.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
