from datetime import datetime, timezone
from services.firebase_service import get_db

MAX_SESSIONS = 50       # max saved sessions per user
MAX_MSGS_PER_SESSION = 200


def save_chat_session(uid: str, session_id: str, title: str, messages: list) -> dict:
    """Create or overwrite a chat session under users/{uid}/chats/{session_id}."""
    db = get_db()
    safe_msgs = messages[:MAX_MSGS_PER_SESSION]
    ref = db.collection("users").document(uid).collection("chats").document(session_id)
    now = datetime.now(timezone.utc).isoformat()

    existing = ref.get()
    created_at = existing.to_dict().get("created_at", now) if existing.exists else now

    ref.set({
        "title": title[:120],
        "created_at": created_at,
        "updated_at": now,
        "messages": safe_msgs,
        "msg_count": len(safe_msgs),
    })

    return {"session_id": session_id, "msg_count": len(safe_msgs)}


def list_chat_sessions(uid: str) -> list:
    """Return metadata list (no messages) sorted newest first."""
    db = get_db()
    col = db.collection("users").document(uid).collection("chats")
    docs = col.order_by("updated_at", direction="DESCENDING").limit(MAX_SESSIONS).stream()

    sessions = []
    for doc in docs:
        d = doc.to_dict()
        sessions.append({
            "session_id": doc.id,
            "title": d.get("title", "Untitled"),
            "created_at": d.get("created_at"),
            "updated_at": d.get("updated_at"),
            "msg_count": d.get("msg_count", 0),
        })
    return sessions


def get_chat_session(uid: str, session_id: str) -> dict | None:
    """Return full session including messages."""
    db = get_db()
    ref = db.collection("users").document(uid).collection("chats").document(session_id)
    doc = ref.get()
    if not doc.exists:
        return None
    d = doc.to_dict()
    d["session_id"] = doc.id
    return d


def delete_chat_session(uid: str, session_id: str) -> bool:
    db = get_db()
    ref = db.collection("users").document(uid).collection("chats").document(session_id)
    if ref.get().exists:
        ref.delete()
        return True
    return False
