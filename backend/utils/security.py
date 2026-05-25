"""
security.py — centralised input sanitisation and validation helpers.

All user-supplied text MUST pass through sanitize_text() before it is
stored or forwarded to the AI model, preventing prompt-injection and
stored-XSS payloads from reaching downstream systems.
"""

import re
import bleach
from typing import Any

# ── Text constants ────────────────────────────────────────────────────────────
MAX_MESSAGE_LEN   = 2_000   # chat message
MAX_HISTORY_TURNS = 20      # conversation history items
MAX_TURN_LEN      = 2_000   # characters per history turn
MAX_FIELD_LEN     = 200     # generic profile string fields
MAX_POLICY_ITEMS  = 10      # existing_policies list length

# bleach: strip ALL tags and attributes (API is plain-text only)
_ALLOWED_TAGS: list = []
_ALLOWED_ATTRS: dict = {}


def sanitize_text(value: str, max_len: int = MAX_FIELD_LEN) -> str:
    """Strip HTML/JS, collapse whitespace, enforce length."""
    if not isinstance(value, str):
        return ""
    cleaned = bleach.clean(value, tags=_ALLOWED_TAGS, attributes=_ALLOWED_ATTRS, strip=True)
    # Collapse multiple newlines to prevent prompt-injection padding
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned[:max_len].strip()


def sanitize_history(history: Any) -> list:
    """Validate and sanitise the conversation history payload."""
    if not isinstance(history, list):
        return []
    safe = []
    for turn in history[:MAX_HISTORY_TURNS]:
        if not isinstance(turn, dict):
            continue
        role = turn.get("role", "")
        content = turn.get("content", "")
        if role not in ("user", "assistant"):
            continue
        safe.append({
            "role": role,
            "content": sanitize_text(content, MAX_TURN_LEN),
        })
    return safe


def sanitize_profile(profile: Any) -> dict:
    """Whitelist-validate profile fields, coerce types, strip unknowns."""
    if not isinstance(profile, dict):
        return {}

    safe: dict = {}

    # String fields
    for field in ("location", "risk_profile"):
        if field in profile and isinstance(profile[field], str):
            safe[field] = sanitize_text(profile[field])

    # Numeric fields — clamp to sane ranges
    numeric_ranges = {
        "age":        (0, 120),
        "dependents": (0, 20),
        "income":     (0, 1_000_000_000),
    }
    for field, (lo, hi) in numeric_ranges.items():
        val = profile.get(field)
        if val is not None:
            try:
                n = int(float(val))
                safe[field] = max(lo, min(hi, n))
            except (TypeError, ValueError):
                pass

    # List of strings
    policies = profile.get("existing_policies")
    if isinstance(policies, list):
        safe["existing_policies"] = [
            sanitize_text(p) for p in policies[:MAX_POLICY_ITEMS]
            if isinstance(p, str)
        ]

    return safe


def validate_email(email: str) -> bool:
    """Basic RFC-compliant email format check."""
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email or ""))
