# Meet.OZ

**AI-powered meeting intelligence platform with real-time emotion detection, live transcription, and Gemini-powered coaching.**

Meet.OZ analyzes participant emotions during video calls using face-api.js, provides live AI coaching tips via Gemini 2.0 Flash, and generates comprehensive post-meeting analytics with charts, summaries, and sentiment Q&A.

---

## Features

### Real-Time Video Calls
- WebRTC video conferencing via Agora SDK
- Dynamic room codes — create or join meetings with shareable links
- Mic, camera, and closed captions toggle controls

### Emotion Detection
- Real-time facial emotion recognition using face-api.js (TinyFaceDetector + FaceLandmark68 + FaceExpression)
- 7 emotions detected: happy, sad, angry, disgusted, fearful, neutral, surprised
- Animated emotion labels on video tiles with color-coded badges
- Live engagement meter (0-100 score) on the call header

### Live Transcription
- Browser-native speech-to-text via Web Speech API
- Auto-restart handling (Chrome stops recognition after ~60s)
- Floating captions overlay with CC toggle
- All transcript data persisted to MongoDB

### AI Coaching (Gemini 2.0 Flash)
- Real-time coaching tips during calls (polls every 20s)
- Post-meeting structured summary: key moments, emotional arc, action items, presenter score & tips
- Sentiment Q&A chat — ask questions about the meeting and get data-backed AI answers

### Analytics Dashboard
- **Emotion Pie Chart** — distribution breakdown with Recharts
- **Emotion Timeline** — 10-second bucketed line chart (fixes original per-millisecond bug)
- **Emotion Heatmap** — horizontal scrollable timeline colored by dominant emotion per 5s window
- **Speaker Effectiveness** — per-participant positive/negative emotion bar chart
- **Transcript with Sentiment** — scrollable transcript with emotion-colored left borders
- **AI Summary** — generated with one click, shows key moments, emotional arc, action items, presenter score
- **Sentiment Q&A** — chat interface for querying meeting dynamics

### Meeting History
- Paginated grid of past meetings with sentiment badges
- Cross-meeting sentiment trend chart
- Click any meeting to view full analytics

### Accessibility
- Keyboard shortcuts: `S` for room mood, `1-4` for participant emotions (speech synthesis)
- Real-time captions for hearing accessibility

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 18 + Tailwind CSS 3 |
| Animations | Framer Motion 11 |
| Charts | Recharts 2 |
| Video | Agora RTC SDK NG 4 |
| Emotion AI | face-api.js + TensorFlow.js 4 |
| Transcription | Web Speech API (Chrome/Edge) |
| Backend | Express 4 + Mongoose 8 |
| Database | MongoDB Atlas |
| AI | Google Gemini 2.0 Flash |
| Auth Tokens | agora-access-token 2 |

---

## Project Structure

```
meet-oz/
├── package.json                 # npm workspaces root
├── .env.example                 # Environment variable template
├── client/                      # Vite + React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Button, Input, Card, Badge
│   │   │   ├── layout/          # Navbar
│   │   │   ├── video/           # VideoTile, VideoGrid, Controls, TranscriptOverlay
│   │   │   ├── emotion/         # EmotionLabel, EngagementMeter
│   │   │   ├── charts/          # PieChart, Timeline, Heatmap, SpeakerEffectiveness, TrendChart
│   │   │   └── ai/              # CoachPanel, AISummary, SentimentChat
│   │   ├── hooks/               # useAgora, useEmotionDetection, useTranscription, sync hooks
│   │   ├── contexts/            # MeetingContext (useReducer)
│   │   ├── services/            # api.js (centralized fetch wrapper)
│   │   ├── pages/               # Home, Call, Analytics, History, NotFound
│   │   └── utils/               # emotionMaps, formatters, constants
│   └── public/models/           # face-api.js ML model weights (~7.4MB)
└── server/                      # Express backend
    └── src/
        ├── config/              # db.js, env.js
        ├── models/              # Meeting.js (Mongoose schema)
        ├── routes/              # agora.js, meetings.js, ai.js
        └── middleware/          # errorHandler.js, rateLimit.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Agora account (free tier: 10,000 min/month)
- Google AI Studio API key (for Gemini)

### 1. Clone & Install

```bash
git clone https://github.com/prkhrv/Meet.OZ.git
cd Meet.OZ
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=5001
MONGODB_URI=mongodb+srv://...your-atlas-uri.../meetoz
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173

VITE_API_URL=http://localhost:5001/api
VITE_AGORA_APP_ID=your_agora_app_id
```

Copy to client directory:
```bash
cp .env client/.env
```

### 3. Run

```bash
npm run dev
```

This starts both servers concurrently:
- **Client**: http://localhost:5173
- **Server**: http://localhost:5001

### 4. Test

1. Open http://localhost:5173
2. Enter your name and click **Create Meeting**
3. Allow camera/microphone access
4. Emotion labels should appear on your video tile after ~2s
5. Speak to generate transcript data
6. Click the leave button to end the call
7. View full analytics on the post-call page

---

## Deployment

### Server — Render (free tier)

1. Create a **Web Service** on [render.com](https://render.com)
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node src/index.js`
5. Add environment variables (MONGODB_URI, AGORA_APP_ID, AGORA_APP_CERTIFICATE, GEMINI_API_KEY, CLIENT_URL)

### Client — Vercel (free tier)

1. Import project on [vercel.com](https://vercel.com)
2. Root Directory: `client`
3. Framework: Vite
4. Add environment variables (VITE_API_URL, VITE_AGORA_APP_ID)

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check |
| POST | `/api/agora/token` | Generate Agora RTC token |
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings/:code` | Get meeting details |
| PUT | `/api/meetings/:code/join` | Join meeting |
| PUT | `/api/meetings/:code/end` | End meeting |
| POST | `/api/meetings/:code/emotions` | Batch-store emotion snapshots |
| POST | `/api/meetings/:code/transcript` | Append transcript segments |
| GET | `/api/meetings/history/list` | Paginated meeting history |
| GET | `/api/meetings/:code/analytics` | Full analytics data |
| POST | `/api/ai/coaching` | Gemini real-time coaching tip |
| POST | `/api/ai/summary` | Gemini post-meeting summary |
| POST | `/api/ai/query` | Gemini sentiment Q&A |

---

## Architecture

```
Browser                          Server                    External
┌─────────────────┐      ┌──────────────────┐     ┌──────────────┐
│  React + Vite   │─────▶│  Express API     │────▶│  MongoDB     │
│                 │      │                  │     │  Atlas       │
│  face-api.js    │      │  Agora Token Gen │     └──────────────┘
│  (emotion AI)   │      │                  │
│                 │      │  Gemini AI       │────▶┌──────────────┐
│  Web Speech API │      │  (coaching,      │     │  Google      │
│  (transcription)│      │   summary, Q&A)  │     │  Gemini API  │
│                 │      └──────────────────┘     └──────────────┘
│  Agora SDK      │─────────────────────────────▶┌──────────────┐
│  (video/audio)  │                               │  Agora RTC   │
└─────────────────┘                               └──────────────┘
```

---

## What Changed from v1

The original Meet.OZ was a hackathon prototype (CRA + face-api.js + Agora). This is a full production revamp:

| Aspect | v1 (Hackathon) | v2 (Current) |
|--------|---------------|--------------|
| Build | Create React App | Vite + npm workspaces monorepo |
| Backend | None | Express + MongoDB |
| Credentials | Hardcoded in source | Environment variables + token server |
| Rooms | Single hardcoded channel | Dynamic room codes |
| Emotion Detection | 100ms interval, DOM queries | 2s interval, ref-based, synced to DB |
| Charts | Victory.js | Recharts (Pie, Timeline, Heatmap, Bar) |
| AI | None | Gemini 2.0 Flash (coaching, summary, Q&A) |
| Transcription | None | Web Speech API with auto-restart |
| Styling | MUI + SCSS | Tailwind CSS + glassmorphism + Framer Motion |
| History | None | Paginated meeting history with trend charts |
| Persistence | In-memory only | Full MongoDB persistence |

---

## License

MIT
