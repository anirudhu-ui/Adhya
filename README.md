# Adhya — Voice AI Insurance Advisor

A full-stack AI-powered insurance advisory platform built with React + GSAP + Firebase and Flask + Gunicorn, powered by Groq's blazing-fast inference.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, GSAP 3, Lucide React, React Router v6 |
| Auth | Firebase Auth (Google + Email) |
| Database | Cloud Firestore |
| Backend | Flask 3, Gunicorn |
| AI | Groq — `llama-3.1-8b-instant` |
| Frontend Host | Vercel |
| Backend Host | Railway |

---

## Project Structure

```
adhya/
├── frontend/                    # React app → Vercel
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Button, Input, Card
│   │   │   ├── layout/          # AppShell, ProtectedRoute
│   │   │   └── voice/           # VoiceOrb, VoiceTranscript, MessageBubble
│   │   ├── context/             # AuthContext (Firebase)
│   │   ├── hooks/               # useVoice, useAdvisor
│   │   ├── pages/               # Login, Signup, Dashboard, Advisor, Plans, Profile
│   │   ├── services/            # firebase.js, api.js
│   │   └── styles/              # globals.css (design tokens)
│   ├── vite.config.js
│   └── vercel.json
│
└── backend/                     # Flask API → Railway
    ├── app.py
    ├── routes/                  # health, advisor, user
    ├── services/                # firebase_service, advisor_service, user_service
    └── utils/                   # auth_middleware
```

---

## Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # fill in your keys
python app.py
# Running on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install

cp .env.example .env.local      # fill in Firebase + backend URL
npm run dev
# Running on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key — get at console.groq.com |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY_ID` | Service account private key ID |
| `FIREBASE_PRIVATE_KEY` | Service account private key (with \n) |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_CLIENT_ID` | Service account client ID |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `PORT` | Server port (Railway sets this automatically) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_API_BASE_URL` | Railway backend URL |

---

## Groq Setup

1. Sign up at console.groq.com
2. Create an API key
3. Add it as `GROQ_API_KEY` in `backend/.env`

Model: **llama-3.1-8b-instant** — extremely low latency, ideal for real-time voice advisory.

---

## Firebase Setup

1. Create a project at console.firebase.google.com
2. Enable Authentication → Email/Password + Google
3. Enable Firestore Database
4. Firestore security rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Generate a Service Account key → copy values to backend .env

---

## Deployment

### Backend → Railway
1. Push backend/ to GitHub
2. New Railway project → Deploy from GitHub
3. Set all env vars in Railway dashboard
4. Procfile: `gunicorn app:app --workers 2 --timeout 120`
5. Copy Railway URL → set as `VITE_API_BASE_URL` in Vercel

### Frontend → Vercel
1. Push frontend/ to GitHub
2. Import into Vercel → Framework: Vite
3. Set all VITE_* env vars
4. vercel.json handles SPA routing

---

## Voice Features

- Speech-to-Text: Web Speech API (en-IN, Chrome/Edge)
- Text-to-Speech: Adhya reads replies aloud after voice input
- Animated orb: GSAP pulse rings (listening) + breathe (speaking)
- Live transcript: real-time display as you speak
