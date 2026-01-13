'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { api, getStageDisplay, type JobStatus } from '@/lib/api'

interface UploadedFile {
  file: File
  name: string
  size: number
}

type ProcessingStage = 
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'summary'
  | 'saving'
  | 'complete'
  | 'error'

export default function RecordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Form state
  const [lectureName, setLectureName] = useState('')
  const [audioFile, setAudioFile] = useState<UploadedFile | null>(null)
  const [slidesFile, setSlidesFile] = useState<UploadedFile | null>(null)
  
  // Processing state
  const [stage, setStage] = useState<ProcessingStage>('idle')
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // Refs
  const audioInputRef = useRef<HTMLInputElement>(null)
  const slidesInputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const completionStartedRef = useRef<boolean>(false)

  // File size formatter
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Handle audio file selection
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/mp4', 'audio/x-m4a']
    const validExtensions = ['mp3', 'wav', 'webm', 'm4a', 'mp4']
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension || '')) {
      setError('Please upload an MP3, WAV, WebM, or M4A audio file')
      return
    }

    if (file.size > 500 * 1024 * 1024) {
      setError('Audio file must be less than 500MB')
      return
    }

    setAudioFile({ file, name: file.name, size: file.size })
    setError(null)
  }

  // Handle slides file selection
  const handleSlidesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
    const validExtensions = ['pdf', 'pptx']
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension || '')) {
      setError('Please upload a PDF or PPTX file')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Slides file must be less than 50MB')
      return
    }

    setSlidesFile({ file, name: file.name, size: file.size })
    setError(null)
  }

  // Remove files
  const removeAudioFile = () => {
    setAudioFile(null)
    if (audioInputRef.current) audioInputRef.current.value = ''
  }

  const removeSlidesFile = () => {
    setSlidesFile(null)
    if (slidesInputRef.current) slidesInputRef.current.value = ''
  }

  // Poll job status
  const pollJobStatus = useCallback(async (jobId: string, lectureId: string) => {
    try {
      const status: JobStatus = await api.getJobStatus(jobId)
      
      setProgress(status.progress)
      const stageDisplay = getStageDisplay(status.stage)
      setStatusMessage(stageDisplay.label)

      if (status.status === 'completed') {
        // Prevent multiple callbacks from running completion logic
        if (completionStartedRef.current) {
          return
        }
        completionStartedRef.current = true

        // Stop polling immediately
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }

        // Get result and generate summary
        setStage('summary')
        setStatusMessage('Generating AI summary...')
        setProgress(90)

        try {
          const result = await api.getJobResult(jobId)

          // Store markdown content locally before any cleanup
          const markdownContent = result.master_document?.markdown_content

          if (markdownContent) {
            // Generate summary using locally stored content
            const summary = await api.generateSummary(markdownContent, lectureName)

            // Save summary to database
            setStage('saving')
            setStatusMessage('Saving to database...')
            setProgress(95)

            await supabase.from('lecture_summaries').upsert({
              lecture_id: lectureId,
              title: summary.title,
              key_concepts: summary.key_concepts,
              definitions: summary.definitions,
              important_points: summary.main_takeaways,
              action_items: [],
            })

            // Update lecture status
            await supabase
              .from('lectures')
              .update({
                status: 'completed',
                has_slides: !!slidesFile,
                has_alignment: !!slidesFile,
              })
              .eq('id', lectureId)
          } else {
            // No markdown content, just mark as completed
            await supabase
              .from('lectures')
              .update({ status: 'completed' })
              .eq('id', lectureId)
          }

          setStage('complete')
          setProgress(100)
          setStatusMessage('Processing complete!')

          // Cleanup job on server AFTER everything is done
          await api.deleteJob(jobId).catch(() => {})

          // Redirect after short delay
          setTimeout(() => {
            router.push(`/lecture/${lectureId}`)
          }, 1500)

        } catch (err) {
          console.error('Summary generation failed:', err)
          // Still mark as complete, just without summary
          await supabase
            .from('lectures')
            .update({ status: 'completed' })
            .eq('id', lectureId)

          // Cleanup job even on error
          await api.deleteJob(jobId).catch(() => {})

          router.push(`/lecture/${lectureId}`)
        }

      } else if (status.status === 'failed') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        
        // Update lecture status
        await supabase
          .from('lectures')
          .update({ status: 'failed' })
          .eq('id', lectureId)

        setStage('error')
        setError(status.error || 'Processing failed')
      }
    } catch (err) {
      console.error('Polling error:', err)
    }
  }, [lectureName, slidesFile, supabase, router])

  // Process lecture
  const handleProcess = async () => {
    if (!audioFile) {
      setError('Please upload an audio file')
      return
    }

    if (!lectureName.trim()) {
      setError('Please enter a lecture name')
      return
    }

    setError(null)
    setStage('uploading')
    setProgress(5)
    setStatusMessage('Uploading files...')
    completionStartedRef.current = false

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Please log in to continue')
        return
      }

      // Create lecture record
      const { data: lecture, error: lectureError } = await supabase
        .from('lectures')
        .insert({
          user_id: user.id,
          title: lectureName.trim(),
          status: 'processing',
          recording_date: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (lectureError || !lecture) {
        throw new Error('Failed to create lecture record')
      }

      // Upload to Python API
      setProgress(10)
      setStatusMessage('Sending to processing server...')

      const jobStatus = await api.processLecture(
        audioFile.file,
        slidesFile?.file
      )

      // Start polling
      setStage('processing')
      setProgress(15)
      
      pollingRef.current = setInterval(() => {
        pollJobStatus(jobStatus.job_id, lecture.id)
      }, 3000)

      // Initial poll
      pollJobStatus(jobStatus.job_id, lecture.id)

    } catch (err) {
      console.error('Processing error:', err)
      setStage('error')
      setError(err instanceof Error ? err.message : 'Failed to start processing')
    }
  }

  const isProcessing = stage !== 'idle' && stage !== 'error'
  const canProcess = audioFile && lectureName.trim() && !isProcessing

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Lecture
        </h1>
        <p className="text-gray-600">
          Upload your lecture audio and slides for AI processing
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        {/* Lecture Name */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Lecture Name *
          </label>
          <input
            type="text"
            value={lectureName}
            onChange={(e) => setLectureName(e.target.value)}
            placeholder="e.g., Introduction to Machine Learning"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isProcessing}
          />
        </div>

        {/* File Upload Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Audio File *
            </label>
            {!audioFile ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                <div className="flex flex-col items-center justify-center py-6">
                  <span className="text-3xl mb-2">🎙️</span>
                  <p className="text-sm font-medium text-gray-600">
                    Click to upload audio
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    MP3, WAV, M4A, WEBM (max 500MB)
                  </p>
                </div>
                <input
                  ref={audioInputRef}
                  type="file"
                  className="hidden"
                  accept=".mp3,.wav,.webm,.m4a,.mp4,audio/*"
                  onChange={handleAudioSelect}
                  disabled={isProcessing}
                />
              </label>
            ) : (
              <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <p className="font-medium text-blue-800 truncate max-w-[200px]">
                        {audioFile.name}
                      </p>
                      <p className="text-xs text-blue-600">
                        {formatFileSize(audioFile.size)}
                      </p>
                    </div>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={removeAudioFile}
                      className="text-blue-600 hover:text-red-500 transition p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Slides Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Slides (Optional)
            </label>
            {!slidesFile ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition">
                <div className="flex flex-col items-center justify-center py-6">
                  <span className="text-3xl mb-2">📊</span>
                  <p className="text-sm font-medium text-gray-600">
                    Click to upload slides
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, PPTX (max 50MB)
                  </p>
                </div>
                <input
                  ref={slidesInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  onChange={handleSlidesSelect}
                  disabled={isProcessing}
                />
              </label>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-medium text-green-800 truncate max-w-[200px]">
                        {slidesFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {formatFileSize(slidesFile.size)}
                      </p>
                    </div>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={removeSlidesFile}
                      className="text-green-600 hover:text-red-500 transition p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        {slidesFile && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">✨ Slides detected!</span> Your audio will be 
              aligned with slide content using AI for enhanced summaries with slide references.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Progress Display */}
        {isProcessing && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {statusMessage}
              </span>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full progress-bar transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This may take 5-10 minutes depending on the lecture length
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleProcess}
          disabled={!canProcess}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <span className="animate-spin">⚙️</span>
              Processing...
            </>
          ) : (
            <>
              <span>🚀</span>
              Process Lecture
            </>
          )}
        </button>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">💡 Tips for Best Results</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            Use clear audio recordings with minimal background noise
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            Upload slides to get AI summaries with slide references
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            Lectures up to 3 hours are supported
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">•</span>
            Processing time: ~5-10 minutes per hour of audio
          </li>
        </ul>
      </div>
    </div>
  )
}
