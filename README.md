# LectureLink Frontend

A lightweight Next.js frontend for the LectureLink AI-powered lecture processing platform.

## Architecture

This frontend is designed to be **minimal and focused**:
- **Next.js 16** with App Router
- **Supabase** for authentication and database
- **Python API** backend at `143.110.211.26:8000` for all processing

All heavy lifting (transcription, slide processing, alignment, AI summaries) is handled by the Python backend. This frontend is purely for UI/UX.

## Features

- 🔐 **Authentication** - Email/Password + Google OAuth via Supabase
- 📊 **Dashboard** - Overview of lectures, stats, quick actions
- 📤 **Upload** - Audio + slides upload with real-time processing status
- 📋 **Lecture View** - AI reports, transcripts, key concepts, definitions

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Authentication (login/signup) |
| `/dashboard` | User dashboard with stats and recent lectures |
| `/record` | Upload audio and slides for processing |
| `/lecture/[id]` | View processed lecture with AI summary |

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Python API (LectureLink Alignment Server)
NEXT_PUBLIC_API_URL=http://143.110.211.26:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
lecturelink-frontend/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Auth page
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   ├── auth/callback/route.ts      # OAuth callback
│   └── (authenticated)/
│       ├── layout.tsx              # Auth wrapper + sidebar
│       ├── dashboard/page.tsx      # Dashboard
│       ├── record/page.tsx         # Upload page
│       └── lecture/[id]/page.tsx   # Lecture detail
├── components/
│   └── Sidebar.tsx                 # Navigation sidebar
├── lib/
│   ├── supabase.ts                 # Browser Supabase client
│   ├── supabase-server.ts          # Server Supabase client
│   ├── api.ts                      # Python API client
│   └── types.ts                    # TypeScript types
└── middleware.ts                   # Route protection
```

## API Integration

The frontend communicates with the Python API for all processing:

```typescript
// Upload and process lecture
const jobStatus = await api.processLecture(audioFile, slidesFile)

// Poll for status
const status = await api.getJobStatus(jobId)

// Get results
const result = await api.getJobResult(jobId)

// Generate AI summary
const summary = await api.generateSummary(markdownContent)
```

### API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | API health check |
| `/api/process` | POST | Upload files, start processing |
| `/api/jobs/{id}/status` | GET | Get processing status |
| `/api/jobs/{id}/result` | GET | Get processing result |
| `/api/generate-summary` | POST | Generate AI summary |
| `/api/jobs/{id}` | DELETE | Cleanup job files |

## Database Schema

Uses existing Supabase tables:

- `profiles` - User data
- `lectures` - Lecture metadata
- `lecture_summaries` - AI-generated summaries
- `lecture_alignments` - Slide alignment data

## Processing Flow

1. User uploads audio (required) + slides (optional)
2. Frontend creates lecture record in Supabase (status: 'processing')
3. Files sent to Python API `/api/process`
4. Frontend polls `/api/jobs/{id}/status` every 3 seconds
5. On completion, fetches result and generates AI summary
6. Summary saved to Supabase
7. Lecture status updated to 'completed'
8. User redirected to lecture detail page

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Auth + Database
- **Python FastAPI** - Backend processing

## Development

```bash
# Development
npm run dev

# Type checking
npm run lint

# Production build
npm run build
```

## Deployment

Deploy to Vercel:

```bash
vercel
```

Or build and run with Node:

```bash
npm run build
npm start
```

## Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://143.110.211.26:8000
```

## License

MIT
