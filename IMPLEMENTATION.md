# Adhya — Pricing Plan Feature: Implementation Guide

## Overview

Two-tier subscription system (Free / Pro) with usage tracking, voice gating, and chat history.

---

## Firestore Schema Changes

### `users/{uid}` (existing doc, new fields added)
```
subscription_tier:    "free" | "pro"       (default: "free")
subscription_started_at: ISO string        (set on upgrade)
msg_count:            int                  (messages used this month)
msg_count_month:      "YYYY-MM"            (for monthly reset logic)
```

### `users/{uid}/chats/{session_id}` (new subcollection — Pro only)
```
title:       string   (first 120 chars of first user message)
created_at:  ISO string
updated_at:  ISO string
messages:    [{role, content, timestamp}]  (max 200 per session)
msg_count:   int
```

---

## Tier Limits

| Feature              | Free       | Pro         |
|----------------------|------------|-------------|
| Messages/month       | 10         | 500         |
| Voice input/output   | ❌ Locked  | ✅          |
| Recent Chats history | ❌ Locked  | ✅ (50 sessions) |
| Reset period         | Monthly    | Monthly     |

---

## New Backend Files

### `services/subscription_service.py`
- `get_subscription_status(uid)` → tier, msg_count, msg_limit, remaining
- `check_and_increment_message(uid)` → {"allowed": bool, "remaining": int}
  - Handles monthly auto-reset
- `upgrade_to_pro(uid)` / `downgrade_to_free(uid)`

### `services/chat_service.py`
- `save_chat_session(uid, session_id, title, messages)`
- `list_chat_sessions(uid)` → metadata list (no message bodies)
- `get_chat_session(uid, session_id)` → full session with messages
- `delete_chat_session(uid, session_id)`

### `routes/subscription.py` (blueprint: `/api/subscription`)
| Method | Path      | Description              |
|--------|-----------|--------------------------|
| GET    | /status   | Get tier + usage         |
| POST   | /upgrade  | Mock upgrade to Pro      |
| POST   | /downgrade| Revert to Free           |

### `routes/chats.py` (blueprint: `/api/chats`) — Pro only
| Method | Path         | Description              |
|--------|--------------|--------------------------|
| GET    | /            | List sessions (metadata) |
| GET    | /:session_id | Get full session         |
| POST   | /            | Save/update session      |
| DELETE | /:session_id | Delete session           |

### Modified: `routes/advisor.py`
- `/api/advisor/chat` now calls `check_and_increment_message()` before processing
- Returns `429` with `{"error": "message_limit_reached"}` when limit hit
- Appends `usage: {remaining, tier, limit}` to successful responses

### Modified: `app.py`
- Registers `subscription_bp` and `chats_bp`
- CORS now includes `DELETE` method

---

## New Frontend Files

### `context/SubscriptionContext.jsx`
Global state: `tier`, `isPro`, `msgCount`, `msgLimit`, `remaining`, `loading`
Methods: `refresh()`, `decrementRemaining()`, `syncUsage(usage)`, `upgrade()`, `downgrade()`
Wrap your app in `<SubscriptionProvider>` (done in `main.jsx`).

### `pages/SubscriptionPage.jsx` → `/dashboard/subscription`
- Two-card pricing UI (Free vs Pro)
- Animated amber glow on Pro card
- Live usage bar showing messages consumed
- Confirm modal before upgrade/downgrade
- Toast notifications on success

### `pages/RecentChatsPage.jsx` → `/dashboard/chats`
- Pro-only; shows lock screen + upgrade CTA for free users
- Search bar to filter conversations
- Slide-in detail panel showing full message history
- Delete individual sessions
- Relative timestamps ("2h ago", "3d ago")

---

## Modified Frontend Files

### `services/api.js`
New methods:
- `getSubscriptionStatus()`, `upgradeSubscription()`, `downgradeSubscription()`
- `listChats()`, `getChat(id)`, `saveChat(id, title, msgs)`, `deleteChat(id)`

### `components/layout/AppShell.jsx`
- PRO/FREE badge next to logo (FREE links to /subscription)
- Mini usage bar in sidebar footer with colour coding (green → yellow → red)
- "Recent Chats" nav item (Pro only, with amber dot)
- "Upgrade to Pro" nudge link for Free users
- "Subscription" nav item

### `pages/AdvisorPage.jsx`
- `remaining` counter badge in header (changes colour at low/zero)
- `LimitBanner` shown when at 0 messages
- Voice orb replaced by `VoiceLockBadge` for Free users (click → /subscription)
- Input disabled + placeholder changes when at limit
- Chat auto-saves to Firestore every 2s (debounced) for Pro users

### `main.jsx`
- Wraps app with `<AuthProvider>` + `<SubscriptionProvider>`

### `components/layout/AuthRoutes.jsx`
- Removed inner `<AuthProvider>` (now in main.jsx)

---

## Integration Checklist

### Backend
- [ ] `FLASK_ENV=development` for local dev (disables force HTTPS)
- [ ] Firebase service account env vars set
- [ ] `pip install -r requirements.txt` (no new deps needed)

### Frontend
- [ ] `VITE_API_BASE_URL` set in `.env`
- [ ] Firebase config env vars set
- [ ] `npm install` (no new deps — uses existing react-router, gsap, lucide-react)

### Firestore Rules (add to your Firebase console)
```
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

---

## Payment Integration Note

The `/api/subscription/upgrade` endpoint currently sets Pro immediately (demo mode).
For production, integrate a payment provider (Razorpay/Stripe):
1. Create order on frontend → send to payment gateway
2. On successful payment callback → webhook hits your backend
3. Webhook verifies signature → calls `upgrade_to_pro(uid)`
4. Frontend polls `/api/subscription/status` to confirm

The mock flow makes it easy to demo and test without real payments.
