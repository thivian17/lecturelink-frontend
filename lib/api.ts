/**
 * LectureLink API Client
 * 
 * Communicates with the Python FastAPI backend for lecture processing.
 * API Server: http://143.110.211.26:8000
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://143.110.211.26:8000'

// Types
export interface JobStatus {
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  stage?: string
  progress: number
  message?: string
  created_at: string
  completed_at?: string
  error?: string
}

export interface JobResult {
  job_id: string
  status: string
  transcription?: {
    sentences: Array<{ text: string; start: number; end: number }>
    total_sentences: number
  }
  slides?: {
    total_slides: number
    slides: Array<{ slide_number: number; title?: string; content: string }>
  }
  alignment?: {
    total_aligned_sentences: number
    coverage_rate: number
  }
  master_document?: {
    markdown_content: string
    total_sections: number
    total_words: number
  }
}

export interface SummaryResponse {
  title: string
  overview: string
  key_concepts: Array<{
    name: string
    explanation: string
    importance: 'high' | 'medium' | 'low'
    related_slides?: number[]
    examples?: string[]
  }>
  definitions: Array<{
    term: string
    definition: string
    context?: string
    first_mentioned_slide?: number
  }>
  main_takeaways: string[]
  study_questions: string[]
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  estimated_study_time_minutes: number
}

export interface HealthCheck {
  status: string
  openai_api_key_set: boolean
  ffmpeg_installed: boolean
  upload_dir_exists: boolean
  results_dir_exists: boolean
  active_jobs: number
  supported_audio_formats: string[]
  supported_slide_formats: string[]
}

// API Functions
export const api = {
  /**
   * Check API server health
   */
  async health(): Promise<HealthCheck> {
    const response = await fetch(`${API_URL}/health`)
    if (!response.ok) {
      throw new Error('API server is not available')
    }
    return response.json()
  },

  /**
   * Process a lecture with audio and slides
   * Returns a job_id for status polling
   */
  async processLecture(
    audioFile: File,
    slidesFile?: File,
    options?: {
      language?: string
      use_multimodal?: boolean
      use_cross_encoder?: boolean
      min_similarity?: number
    }
  ): Promise<JobStatus> {
    const formData = new FormData()
    formData.append('audio', audioFile)
    
    if (slidesFile) {
      formData.append('slides', slidesFile)
    }
    
    if (options?.language) {
      formData.append('language', options.language)
    }

    const response = await fetch(`${API_URL}/api/process`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to start processing')
    }

    return response.json()
  },

  /**
   * Poll job status
   * Call every 2-3 seconds while status is 'processing'
   */
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/status`)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Job not found')
      }
      throw new Error('Failed to get job status')
    }

    return response.json()
  },

  /**
   * Get job result after completion
   */
  async getJobResult(jobId: string): Promise<JobResult> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}/result`)
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Job not found')
      }
      throw new Error('Failed to get job result')
    }

    return response.json()
  },

  /**
   * Generate AI summary from master document
   */
  async generateSummary(
    markdownContent: string,
    lectureTitle?: string
  ): Promise<SummaryResponse> {
    const response = await fetch(`${API_URL}/api/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        markdown_content: markdownContent,
        lecture_title: lectureTitle,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to generate summary')
    }

    return response.json()
  },

  /**
   * Delete a job and its files
   */
  async deleteJob(jobId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
      method: 'DELETE',
    })

    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to delete job')
    }
  },
}

// Stage display helpers
export const STAGE_INFO: Record<string, { icon: string; label: string }> = {
  audio_conversion: { icon: '🔄', label: 'Converting audio...' },
  transcription: { icon: '🎙️', label: 'Transcribing audio...' },
  slides: { icon: '📊', label: 'Processing slides...' },
  alignment: { icon: '🔗', label: 'Aligning content...' },
  document: { icon: '📄', label: 'Generating document...' },
  complete: { icon: '✅', label: 'Processing complete!' },
}

export function getStageDisplay(stage?: string) {
  return STAGE_INFO[stage || ''] || { icon: '⏳', label: 'Processing...' }
}
