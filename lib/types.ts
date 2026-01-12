/**
 * Shared TypeScript types for LectureLink
 */

// Database types (matching Supabase schema)
export interface Profile {
  id: string
  email: string
  full_name?: string
  subscription_tier: 'free' | 'student' | 'professional'
  monthly_recording_minutes: number
  created_at: string
  updated_at: string
}

export interface Lecture {
  id: string
  user_id: string
  title: string
  recording_date: string
  duration?: number
  status: 'processing' | 'completed' | 'failed'
  transcript?: string
  has_slides: boolean
  has_alignment: boolean
  created_at: string
  updated_at: string
}

export interface LectureSummary {
  id: string
  lecture_id: string
  title?: string
  key_concepts: KeyConcept[]
  definitions: Definition[]
  action_items: ActionItem[]
  important_points: string[]
  summary?: string
  created_at: string
  updated_at: string
}

export interface KeyConcept {
  name?: string
  concept?: string
  term?: string
  explanation?: string
  definition?: string
  importance?: 'high' | 'medium' | 'low'
  slide_reference?: number
  related_slides?: number[]
  examples?: string[]
}

export interface Definition {
  term: string
  definition: string
  context?: string
  slide_reference?: number
  first_mentioned_slide?: number
  source?: 'slide' | 'transcript'
}

export interface ActionItem {
  item?: string
  task?: string
  due_date?: string
  context?: string
  slide_reference?: number
}

// Extended lecture with summary (for queries with joins)
export interface LectureWithSummary extends Lecture {
  lecture_summaries?: LectureSummary | LectureSummary[]
}

// Dashboard stats
export interface DashboardStats {
  totalLectures: number
  completedLectures: number
  totalDurationMinutes: number
  totalConcepts: number
}

// Processing states
export type ProcessingStage = 
  | 'idle'
  | 'uploading'
  | 'audio_conversion'
  | 'transcription'
  | 'slides'
  | 'alignment'
  | 'document'
  | 'summary'
  | 'complete'
  | 'error'

export interface ProcessingState {
  stage: ProcessingStage
  progress: number
  message: string
  jobId?: string
  error?: string
}

// File upload types
export interface UploadedFile {
  file: File
  name: string
  size: number
  type: string
}

// Form types
export interface RecordFormData {
  lectureName: string
  audioFile: UploadedFile | null
  slidesFile: UploadedFile | null
}
