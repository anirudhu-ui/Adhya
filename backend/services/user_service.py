from services.firebase_service import get_db
from datetime import datetime, timezone


def get_user_profile(uid: str) -> dict:
    db = get_db()
    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        return {"uid": uid, "profile": {}}
    return {"uid": uid, "profile": doc.to_dict()}


def update_user_profile(uid: str, data: dict) -> dict:
    db = get_db()
    allowed_fields = {"name", "age", "income", "dependents", "existing_policies", "risk_profile", "location"}
    filtered = {k: v for k, v in data.items() if k in allowed_fields}
    filtered["updated_at"] = datetime.now(timezone.utc).isoformat()

    db.collection("users").document(uid).set(filtered, merge=True)
    return {"uid": uid, "updated": list(filtered.keys())}
