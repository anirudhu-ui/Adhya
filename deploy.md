# Adhya — Production Deployment Guide

> Stack: React + Vite (Vercel) · Flask + Gunicorn (Railway) · Firebase · Groq

---

## Pre-flight checklist

Before touching GitHub, confirm all patched files are in place:

| File | Change |
|---|---|
| `backend/routes/health.py` | `/health/debug` gated to `FLASK_ENV=development` |
| `backend/routes/subscription.py` | Upgrade/downgrade endpoints removed |
| `backend/routes/chats.py` | Pro gate removed |
| `backend/routes/advisor.py` | Daily limit messaging, truncated UID logs |
| `backend/services/subscription_service.py` | Atomic Firestore transaction, daily counter |
| `backend/extensions.py` | Rate limiter reads `REDIS_URL` from env |
| `frontend/src/pages/LoginPage.jsx` | `mapAuthError()` — no raw Firebase errors |
| `frontend/src/pages/SignupPage.jsx` | `mapAuthError()` — no raw Firebase errors |
| `frontend/src/pages/AdvisorPage.jsx` | `crypto.randomUUID()` session IDs, no Pro gate |
| `frontend/src/pages/SubscriptionPage.jsx` | Demo plan only, 10 msg/day explainer |
| `frontend/src/components/layout/AppShell.jsx` | No upgrade nudge, no FREE/PRO badge |
| `frontend/src/context/SubscriptionContext.jsx` | No tier/isPro/upgrade/downgrade |
| `frontend/src/services/api.js` | No upgradeSubscription/downgradeSubscription |
| `frontend/vercel.json` | fontshare.com added to CSP |

---

## Step 1 — What to commit to GitHub

### ✅ Safe to commit (commit everything EXCEPT the list below)

```
adhya/
├── backend/
│   ├── app.py
│   ├── extensions.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── routes/
│   ├── services/
│   └── utils/
└── frontend/
    ├── src/
    ├── public/
    ├── index.html
    ├── vite.config.js
    ├── vercel.json
    ├── package.json
    └── package-lock.json
```

### ❌ Never commit these — add to `.gitignore`

```gitignore
# backend
backend/.env
backend/__pycache__/
backend/**/__pycache__/
backend/*.pyc
backend/firebase-service-account.json
backend/serviceAccountKey.json

# frontend
frontend/.env
frontend/.env.local
frontend/.env.production
frontend/node_modules/
frontend/dist/
frontend/vite-dev.log
frontend/vite-dev.err.log

# general
.DS_Store
*.log
```

### Create/update `.gitignore` in your repo root:

```bash
# run from repo root
cat >> .gitignore << 'EOF'
backend/.env
backend/__pycache__/
backend/**/__pycache__/
*.pyc
*.pyo
node_modules/
dist/
.env
.env.local
.env.production
firebase-service-account.json
serviceAccountKey.json
vite-dev.log
vite-dev.err.log
.DS_Store
EOF
```

### Push to GitHub:

```bash
git add .
git status          # review — confirm no .env or secrets appear
git commit -m "feat: production-ready Adhya with daily limit + security fixes"
git push origin main
```

---

## Step 2 — Firebase Console setup

### 2a — Firestore Security Rules

Go to **Firebase Console → Firestore → Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /chats/{chatId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

Click **Publish**.

### 2b — Enable email enumeration protection

Go to **Firebase Console → Authentication → Settings → User enumeration protection** → toggle ON.

### 2c — Add your production domains to Authorized Domains

Go to **Firebase Console → Authentication → Settings → Authorized domains** → Add:
- Your Vercel domain: `adhya-xxx.vercel.app`
- Your custom domain if you have one

### 2d — Get your Firebase service account key (for Railway)

Go to **Firebase Console → Project Settings (gear icon) → Service Accounts → Generate new private key**

This downloads a JSON file. Do NOT commit it. You'll extract values from it for Railway env vars.

---

## Step 3 — Railway (Backend)

### 3a — Create Railway project

1. Go to [railway.app](https://railway.app) → New Project → **Deploy from GitHub repo**
2. Select your repo → select the **`backend`** folder as the root directory
   - In Railway: Service Settings → **Root Directory** → set to `backend`
3. Railway will detect the `Procfile` automatically:
   ```
   web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
   ```

### 3b — Add environment variables

Go to your Railway service → **Variables** tab → add each one:

```env
# Flask
FLASK_ENV=production

# Groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# CORS — set this to your Vercel URL after deploying frontend
ALLOWED_ORIGINS=https://adhya-xxx.vercel.app

# Firebase service account — extract from the JSON file you downloaded
FIREBASE_PROJECT_ID=adhya-b6467
FIREBASE_PRIVATE_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nXXXXX\n-----END RSA PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@adhya-b6467.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
```

> ⚠️ For `FIREBASE_PRIVATE_KEY` — copy the entire key including `-----BEGIN...-----END-----` with `\n` for newlines. In Railway's variable editor paste it with actual newlines, Railway handles the escaping.

### 3c — Add Redis (fixes rate limiter across workers)

In Railway → your project → **New Service → Database → Redis**

Once provisioned, Railway auto-creates a `REDIS_URL` variable in your project. Your `extensions.py` already reads it:
```python
storage_uri=os.environ.get("REDIS_URL", "memory://")
```

Link the Redis service to your backend service:
- Railway dashboard → your backend service → **Variables** → click **Add Reference** → select `REDIS_URL` from the Redis service.

### 3d — Get your Railway URL

After first deploy, go to **Settings → Domains** → Railway gives you a URL like:
```
https://adhya-backend-production.up.railway.app
```

Copy this — you need it for Vercel env vars.

### 3e — Verify backend is live

```bash
curl https://adhya-backend-production.up.railway.app/health
# Expected: {"status":"ok","service":"Adhya AI Advisor API"}

curl https://adhya-backend-production.up.railway.app/health/debug
# Expected: {"error":"not_found"} with 404 — correct, it's gated
```

---

## Step 4 — Vercel (Frontend)

### 4a — Import project

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repo
3. Set **Root Directory** to `frontend`
4. Framework preset: **Vite** (Vercel auto-detects)
5. Build command: `npm run build`
6. Output directory: `dist`

### 4b — Add environment variables

In Vercel → your project → **Settings → Environment Variables** → add:

```env
VITE_API_BASE_URL=https://adhya-backend-production.up.railway.app
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=adhya-b6467.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=adhya-b6467
VITE_FIREBASE_STORAGE_BUCKET=adhya-b6467.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxx
VITE_FIREBASE_APP_ID=1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxx
```

> These come from your Firebase Console → Project Settings → Your apps → Web app → SDK setup.

### 4c — Deploy

Click **Deploy**. Vercel builds and gives you a URL like:
```
https://adhya-xxx.vercel.app
```

### 4d — Update Railway ALLOWED_ORIGINS

Go back to Railway → your backend service → Variables → update:
```
ALLOWED_ORIGINS=https://adhya-xxx.vercel.app
```

Trigger a redeploy on Railway (or it picks it up automatically).

---

## Step 5 — Post-deployment verification

Run these checks after both services are live:

### Backend checks
```bash
RAILWAY_URL=https://adhya-backend-production.up.railway.app

# 1. Health check
curl $RAILWAY_URL/health
# ✅ {"status":"ok"}

# 2. Debug endpoint locked
curl $RAILWAY_URL/health/debug
# ✅ 404 {"error":"not_found"}

# 3. Auth required on all routes
curl $RAILWAY_URL/api/chats
# ✅ 401 {"error":"missing_token"}

curl $RAILWAY_URL/api/advisor/chat -X POST -H "Content-Type: application/json" -d '{"message":"hi"}'
# ✅ 401 {"error":"missing_token"}
```

### Frontend checks
- [ ] Login with Google works
- [ ] Login with email works — wrong password shows "Invalid email or password." (not Firebase internals)
- [ ] Signup with existing email shows "An account with this email already exists."
- [ ] Daily counter shows in AdvisorPage header
- [ ] Sending 10 messages shows limit banner "Resets at midnight UTC"
- [ ] Usage page shows Demo Plan, no Free/Pro cards, no upgrade button
- [ ] Sidebar has no "Upgrade to Pro" button
- [ ] `/health/debug` returns 404 in browser

---

## Step 6 — Future improvements (not blocking launch)

These are the remaining open findings from the security audit that don't block a demo launch but should be addressed before any real users or real money:

| Finding | What to do |
|---|---|
| F-04 Firebase App Check | Enable in Firebase Console → App Check → Register your Vercel domain with reCAPTCHA v3 |
| F-07 CSP unsafe-inline | Install `vite-plugin-csp`, generate script hashes at build time, remove `unsafe-inline` |
| F-08 Prompt injection | Add regex sanitiser stripping `IGNORE/INSTRUCTIONS/SYSTEM` from profile fields before LLM injection |
| F-10 UID logging | Already partially fixed (`.8s` truncation). Full fix: `hashlib.sha256(uid.encode()).hexdigest()[:12]` |

---

## Quick reference — env vars summary

### Railway (backend)
| Variable | Where to get it |
|---|---|
| `FLASK_ENV` | Set to `production` |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → API Keys |
| `ALLOWED_ORIGINS` | Your Vercel URL |
| `FIREBASE_PROJECT_ID` | Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY` | Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase service account JSON |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account JSON |
| `FIREBASE_CLIENT_ID` | Firebase service account JSON |
| `REDIS_URL` | Auto-set by Railway Redis addon |

### Vercel (frontend)
| Variable | Where to get it |
|---|---|
| `VITE_API_BASE_URL` | Your Railway URL |
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console → Project Settings → Web app |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings → Web app |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console → Project Settings → Web app |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Project Settings → Web app |
| `VITE_FIREBASE_APP_ID` | Firebase Console → Project Settings → Web app |

---

*Adhya — Demo deployment guide · Generated May 2026*