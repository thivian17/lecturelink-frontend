# LectureLink Frontend Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Key Features & Functionality](#4-key-features--functionality)
5. [Core Components](#5-core-components)
6. [State Management & Data Flow](#6-state-management--data-flow)
7. [API Integrations](#7-api-integrations)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Data Models & Types](#9-data-models--types)
10. [Styling Approach](#10-styling-approach)
11. [Configuration Files](#11-configuration-files)
12. [Key Architectural Patterns](#12-key-architectural-patterns)
13. [Processing Workflow](#13-processing-workflow)
14. [User Experience Flows](#14-user-experience-flows)
15. [Error Handling](#15-error-handling)
16. [Responsive Design](#16-responsive-design)
17. [Security Features](#17-security-features)
18. [Performance Optimizations](#18-performance-optimizations)
19. [Development Workflow](#19-development-workflow)
20. [Deployment](#20-deployment)

---

## 1. Project Overview

**Project Name:** LectureLink Frontend
**Version:** 0.1.0
**Purpose:** A lightweight, AI-powered frontend for processing lectures through transcription, slide analysis, and intelligent summarization.

### Target Users
Students who want to transform their lecture recordings into structured study guides.

### Key Value Proposition
- Upload lecture recordings + slides
- AI-powered transcription and processing
- Automatic content alignment and extraction
- AI-generated summaries with key concepts and definitions
- All heavy processing handled by Python backend

---

## 2. Technology Stack

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.3 | UI library |
| TypeScript | 5 | Type-safe development |

### Backend Integration
| Technology | Purpose |
|------------|---------|
| Python FastAPI | Processing backend at `143.110.211.26:8000` |

### Authentication & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | - | Authentication & database |
| @supabase/supabase-js | 2.90.1 | Client SDK |
| @supabase/ssr | 0.8.0 | Server-side rendering support |

### Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4 | Utility-first CSS framework |
| PostCSS | - | CSS processing |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint 9 | Code linting |
| Node 20+ | Runtime |

---

## 3. Project Structure

```
lecturelink-frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                   # Root layout with metadata
│   ├── page.tsx                     # Landing page (/)
│   ├── login/page.tsx               # Authentication page (/login)
│   ├── globals.css                  # Global styles and theme
│   ├── auth/callback/route.ts       # OAuth callback handler
│   └── (authenticated)/             # Protected routes group
│       ├── layout.tsx               # Auth wrapper + sidebar
│       ├── dashboard/page.tsx       # Dashboard with stats (/dashboard)
│       ├── record/page.tsx          # Upload/process page (/record)
│       └── lecture/[id]/page.tsx    # Lecture detail view (/lecture/[id])
│
├── components/
│   └── Sidebar.tsx                  # Navigation sidebar component
│
├── lib/
│   ├── types.ts                     # TypeScript interfaces
│   ├── supabase.ts                  # Browser Supabase client
│   ├── supabase-server.ts           # Server Supabase client
│   └── api.ts                       # Python API client
│
├── middleware.ts                    # Route protection & auth refresh
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript config
├── eslint.config.mjs                # ESLint configuration
├── postcss.config.mjs               # PostCSS configuration
├── package.json                     # Dependencies
└── .env.example                     # Environment template
```

---

## 4. Key Features & Functionality

### A. Landing Page (`/`)
- Hero section with call-to-action
- Feature showcase (3-step process)
- Intelligent content extraction highlights
- FAQ-style terminal demo
- CTA section for signup

### B. Authentication (`/login`)
- Dual authentication modes:
  - Email/Password (login & signup)
  - Google OAuth via Supabase
- Login/signup toggle
- Redirect to dashboard on success
- Email confirmation for signup
- Error handling with user-friendly messages

### C. Dashboard (`/dashboard`)

**User Greeting:** Personalized welcome message

**Statistics Cards (4):**
- Total Lectures count
- Completed Lectures count
- Total Duration (minutes)
- Concepts Extracted (across all lectures)

**Recent Lectures List:**
- Title, status badge, date, duration, concept count
- Click to view lecture details
- Empty state with upload CTA

**Quick Actions Sidebar:**
- Upload new lecture button
- Tips card (file formats, timing, supported formats)

### D. Upload Page (`/record`)

**Form Inputs:**
- Lecture name (required text input)
- Audio file upload (required) - MP3, WAV, M4A, WebM up to 500MB
- Slides file upload (optional) - PDF, PPTX up to 50MB

**File Management:**
- Drag-drop or click-to-upload interface
- File preview with size display
- Remove/replace functionality

**Processing Flow:**
1. Uploading → Processing (polls every 3 seconds) → Summary generation → Saving → Complete
2. Real-time progress bar with percentage
3. Stage-specific messages and icons
4. 5-10 minute processing time per hour of audio

### E. Lecture Detail Page (`/lecture/[id]`)

**Header Section:**
- Lecture title
- Date, duration, slides indicator
- Status badge (Completed/Processing/Failed)

**Processing Banner:** Shows when status = 'processing'

**Two-Tab Interface:**

| Tab | Content |
|-----|---------|
| AI Report | Key Concepts, Definitions, Key Takeaways, Action Items |
| Transcript | Full lecture transcript (scrollable) |

**Auto-refresh capability:** For live updates during processing

### F. Navigation Sidebar (Authenticated Routes)
- Logo with branding
- Navigation items: Dashboard, New Lecture (Upload)
- User Profile Section: Avatar, display name, email, Sign Out button

---

## 5. Core Components

### Sidebar.tsx
**Location:** `components/Sidebar.tsx`

- Client-side navigation component
- Active route highlighting
- User profile with logout
- Responsive navigation items

### Page Components
All page components use Next.js App Router patterns:
- Server-side data fetching where appropriate
- Client-side interactivity for forms
- Suspense boundaries for async operations

---

## 6. State Management & Data Flow

### No External State Management Library
The application uses:
- React hooks (`useState`, `useEffect`, `useCallback`)
- Local component state for forms
- Supabase for persistent state (database)

### Server-Side Data Fetching
- Dashboard: Fetches lectures and stats server-side
- Lecture Detail: Fetches lecture + summary in `useEffect`

### Client-Side State
- Form inputs (`lectureName`, `audioFile`, `slidesFile`)
- Processing state (`stage`, `progress`, `error`)
- Active tabs (report vs transcript)

---

## 7. API Integrations

### A. Supabase Integration

#### Authentication
- Email/password signup and signin
- Google OAuth with redirect handling
- Session persistence via cookies
- Session refresh in middleware

#### Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User data (id, email, full_name, subscription_tier, monthly_recording_minutes) |
| `lectures` | Lecture metadata (id, user_id, title, status, duration, has_slides, transcript) |
| `lecture_summaries` | AI summaries (id, lecture_id, key_concepts, definitions, action_items) |
| `lecture_alignments` | Slide alignment data (optional) |

### B. Python API Client

**Location:** `lib/api.ts`

#### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | API health check |
| `/api/process` | POST | Upload audio+slides, start processing |
| `/api/jobs/{id}/status` | GET | Poll processing status (every 3 sec) |
| `/api/jobs/{id}/result` | GET | Retrieve processed results |
| `/api/generate-summary` | POST | Generate AI summary from markdown |
| `/api/jobs/{id}` | DELETE | Cleanup job files |

#### Processing Stages
1. `audio_conversion` - Audio format conversion
2. `transcription` - Speech-to-text
3. `slides` - PDF/PPTX extraction
4. `alignment` - Semantic content alignment
5. `document` - Master document generation
6. `summary` - AI summary generation

---

## 8. Authentication & Authorization

### Implementation
**Middleware-Based Route Protection** (`middleware.ts`)

| Route Type | Routes | Behavior |
|------------|--------|----------|
| Protected | `/dashboard`, `/record`, `/lecture` | Redirect to login if unauthenticated |
| Auth | `/login` | Redirect to dashboard if authenticated |

### Auth Flow
```
1. User signs up/logs in on /login page
          ↓
2. Supabase handles authentication
          ↓
3. Session stored in cookies
          ↓
4. Middleware checks session on protected routes
          ↓
5. OAuth callback handled at /auth/callback
```

### Session Management
- Server-side Supabase client with cookie handling
- Browser-side singleton instance for client components
- Automatic session refresh

---

## 9. Data Models & Types

**Location:** `lib/types.ts`

### Core Interfaces

```typescript
interface Profile {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: string;
  monthly_recording_minutes: number;
  created_at: string;
  updated_at: string;
}

interface Lecture {
  id: string;
  user_id: string;
  title: string;
  recording_date: string;
  duration: number;
  status: 'processing' | 'completed' | 'failed';
  transcript: string;
  has_slides: boolean;
  has_alignment: boolean;
  created_at: string;
  updated_at: string;
}

interface LectureSummary {
  id: string;
  lecture_id: string;
  title: string;
  key_concepts: KeyConcept[];
  definitions: Definition[];
  action_items: ActionItem[];
  important_points: string[];
  created_at: string;
  updated_at: string;
}

interface KeyConcept {
  name?: string;
  concept?: string;
  term?: string;
  explanation?: string;
  definition?: string;
  importance: string;
  slide_reference?: string;
  related_slides?: string[];
  examples?: string[];
}

interface Definition {
  term: string;
  definition: string;
  context?: string;
  slide_reference?: string;
  source?: string;
}

interface ActionItem {
  item?: string;
  task?: string;
  due_date?: string;
  context?: string;
  slide_reference?: string;
}

type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'audio_conversion'
  | 'transcription'
  | 'slides'
  | 'alignment'
  | 'document'
  | 'summary'
  | 'complete'
  | 'error';
```

---

## 10. Styling Approach

### Tailwind CSS + Custom CSS

**Global Styling Location:** `app/globals.css`

### Features
- CSS Variables for theming (colors, spacing)
- Dark mode support via `prefers-color-scheme`
- Custom animations:
  - `fade-in` - Smooth entrance
  - `pulse-ring` - Ripple effect
  - `spin` - Loading spinner
- Custom scrollbar styling
- Progress bar gradient

### Color Palette
| Color | Usage | Hex |
|-------|-------|-----|
| Primary | Buttons, links | `#3B82F6` (Blue) |
| Success | Completed status | Green |
| Warning | Pending status | Yellow |
| Error | Failed status, errors | Red |
| Neutral | Text, backgrounds | Grays |

### Utility-First Approach
- All component styling via Tailwind classes
- Consistent spacing, colors, and sizing
- Responsive design with `md:`, `lg:` breakpoints

---

## 11. Configuration Files

### next.config.ts
- Minimal configuration
- Uses default Next.js 16 settings

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### .env.example
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://143.110.211.26:8000
```

---

## 12. Key Architectural Patterns

### A. Route Groups for Layout Organization
- `(authenticated)` group wraps protected routes
- Shared layout applied to all nested routes
- Clean separation of public vs. authenticated pages

### B. Server Components + Client Components
- Dashboard uses server-side data fetching
- Forms and interactive elements use client components
- Suspense boundaries for async operations

### C. Polling Pattern
```javascript
// Record page polls job status every 3 seconds
const interval = setInterval(async () => {
  const status = await checkJobStatus(jobId);
  if (status === 'completed' || status === 'failed') {
    clearInterval(interval);
  }
}, 3000);
```

### D. Type-Safe API Integration
- TypeScript interfaces for all API responses
- Centralized API client in `lib/api.ts`
- Error handling with type guards

### E. Cookie-Based Session Management
- Supabase SSR pattern for Next.js
- Automatic session refresh in middleware
- Secure cookie storage

---

## 13. Processing Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User uploads lecture name + audio + optional slides     │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend creates lecture record in Supabase             │
│     (status: 'processing')                                  │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Files sent to Python API /api/process endpoint          │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Frontend polls /api/jobs/{id}/status every 3 seconds    │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Displays progress with stage-specific messages          │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. On completion, fetches result and generates AI summary  │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  7. Saves summary to lecture_summaries table                │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  8. Updates lecture status to 'completed'                   │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  9. User redirected to lecture detail page                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. User Experience Flows

### New User Flow
```
Landing Page → Sign Up → Email Verification → Dashboard → Upload First Lecture → View Results
```

### Returning User Flow
```
Login → Dashboard (Stats & Recent Lectures) → View Lecture Details OR Upload New Lecture
```

### Lecture Processing Flow
```
Enter Name → Upload Files → View Progress (5-10 min) → Auto-redirect to Results → View Summary
```

---

## 15. Error Handling

### Frontend Error Management
| Type | Handling |
|------|----------|
| File validation | Type and size checks before upload |
| Supabase errors | User-friendly error messages |
| API failures | Fallback handling and retry logic |
| Processing failures | Detection and display of failure state |
| Form validation | Required field validation |

### User Feedback
| Feedback Type | Visual Style |
|---------------|--------------|
| Error | Red background banner |
| Success | Green background message |
| Processing | Icons and status labels |
| Empty state | Helpful CTA messages |

---

## 16. Responsive Design

### Breakpoints
| Breakpoint | Width | Usage |
|------------|-------|-------|
| Default | 0px+ | Mobile-first styles |
| `md:` | 768px+ | Tablet adjustments |
| `lg:` | 1024px+ | Desktop layout |

### Layout Examples
| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Dashboard Stats | 1 column | 2 columns | 4 columns |
| Dashboard Grid | Single column | 2 columns | 3 columns with sidebar |
| File Uploads | Stacked | 2 columns | 2 columns |

---

## 17. Security Features

1. **Route Protection:** Middleware prevents unauthorized access
2. **Session Management:** Secure cookie-based sessions via Supabase
3. **File Validation:** Client-side type and size checks
4. **OAuth Redirect:** Secure callback handler with error handling
5. **Server-Side Authentication:** Session refresh on every request
6. **Type Safety:** TypeScript prevents injection attacks

---

## 18. Performance Optimizations

| Optimization | Implementation |
|--------------|----------------|
| Server-Side Rendering | Dashboard data fetched server-side |
| Image Optimization | Lazy-loaded user avatars |
| Code Splitting | Next.js automatic route-based splitting |
| Suspense Boundaries | Progressive loading on login page |
| Efficient Polling | 3-second intervals instead of real-time |
| Memoization | `useCallback` for event handlers |

---

## 19. Development Workflow

### Available Scripts

```bash
# Start development server (localhost:3000)
npm run dev

# Production build
npm run build

# Run production server
npm start

# Run ESLint
npm run lint
```

### Development Process
1. Clone the repository
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env` and fill in credentials
4. Run `npm run dev` to start development server
5. Open `http://localhost:3000`

### Environment Setup
Create a `.env` file with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://143.110.211.26:8000
```

---

## 20. Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker/Self-Hosted
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Configuration
1. Set up Supabase project and obtain API keys
2. Configure Python API server
3. Set up OAuth redirect URLs in Supabase dashboard
4. Configure environment variables in deployment platform

### Checklist
- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Python backend accessible
- [ ] OAuth redirect URLs configured
- [ ] Domain configured (for production)

---

## File Reference

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with metadata |
| `app/page.tsx` | Landing page |
| `app/login/page.tsx` | Authentication page |
| `app/globals.css` | Global styles |
| `app/auth/callback/route.ts` | OAuth callback |
| `app/(authenticated)/layout.tsx` | Protected routes layout |
| `app/(authenticated)/dashboard/page.tsx` | Dashboard |
| `app/(authenticated)/record/page.tsx` | Upload page |
| `app/(authenticated)/lecture/[id]/page.tsx` | Lecture detail |
| `components/Sidebar.tsx` | Navigation sidebar |
| `lib/api.ts` | Python API client |
| `lib/types.ts` | TypeScript interfaces |
| `lib/supabase.ts` | Browser Supabase client |
| `lib/supabase-server.ts` | Server Supabase client |
| `middleware.ts` | Route protection |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is proprietary software. All rights reserved.
