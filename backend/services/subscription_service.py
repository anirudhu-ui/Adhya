from datetime import datetime, timezone
from google.cloud import firestore
from services.firebase_service import get_db

DAILY_MSG_LIMIT = 10


def _today() -> str:
    """Return current UTC date as YYYY-MM-DD."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def get_subscription_status(uid: str) -> dict:
    """Return msg_count, remaining, limit, reset_date for a user."""
    db = get_db()
    doc = db.collection("users").document(uid).get()
    data = doc.to_dict() if doc.exists else {}

    today = _today()
    stored_date = data.get("msg_count_date", "")
    msg_count = data.get("msg_count_day", 0) if stored_date == today else 0

    remaining = max(0, DAILY_MSG_LIMIT - msg_count)
    return {
        "msg_count": msg_count,
        "msg_limit": DAILY_MSG_LIMIT,
        "remaining": remaining,
        "reset_date": today,
    }


@firestore.transactional
def _increment_in_txn(transaction, ref, today: str):
    """
    Atomic read-check-write inside a Firestore transaction.
    Returns (allowed: bool, remaining: int).
    """
    snapshot = ref.get(transaction=transaction)
    data = snapshot.to_dict() if snapshot.exists else {}

    stored_date = data.get("msg_count_date", "")
    # Reset counter if it's a new day
    count = data.get("msg_count_day", 0) if stored_date == today else 0

    if count >= DAILY_MSG_LIMIT:
        return False, 0

    new_count = count + 1
    transaction.set(
        ref,
        {"msg_count_day": new_count, "msg_count_date": today},
        merge=True,
    )
    return True, max(0, DAILY_MSG_LIMIT - new_count)


def check_and_increment_message(uid: str) -> dict:
    """
    Atomically check + increment daily message counter.
    Returns {"allowed": bool, "remaining": int, "limit": int}
    """
    db = get_db()
    ref = db.collection("users").document(uid)
    transaction = db.transaction()
    today = _today()

    allowed, remaining = _increment_in_txn(transaction, ref, today)
    return {
        "allowed": allowed,
        "remaining": remaining,
        "limit": DAILY_MSG_LIMIT,
    }
