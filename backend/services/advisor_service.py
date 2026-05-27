import os
import json
from groq import Groq

MODEL = "llama-3.1-8b-instant"
import logging
logger = logging.getLogger(__name__)

# Lazy-initialized — avoids crashing at import time when .env isn't loaded yet.
_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Copy backend/.env.example to backend/.env and fill in your key."
            )
        _client = Groq(api_key=api_key)
    return _client


SYSTEM_PROMPT = """You are Adhya, a sharp and friendly insurance advisor. You give clear, direct answers — like a knowledgeable friend, not a textbook.

TONE: Warm, confident, conversational. Never formal or robotic.

FORMAT RULES — follow these strictly:
- Write in short paragraphs (2–4 sentences each). Maximum 3 paragraphs total.
- Never use numbered lists, bullet points, or headers.
- Bold only the single most important term or number per reply using **bold**.
- Total reply length: 60–120 words for simple questions, 120–200 words for detailed ones. Hard cap at 200 words.
- If the user asks for a full breakdown, still write in paragraphs — just use up to 3 of them.

CONTENT RULES:
- Lead with the most useful insight, not a preamble.
- Mention one concrete watch-out or caveat per reply.
- Never say "Great question" or "Certainly!" or similar filler.
- Don't recommend consulting an advisor on every reply — only when genuinely needed.

After your reply, suggest 2 short follow-up questions (under 8 words each).

Respond ONLY in this JSON format — no markdown fences, no preamble:
{ "reply": "...", "suggestions": ["...", "..."] }
"""


def _build_messages(message: str, history: list, profile: dict) -> list:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if profile:
        profile_ctx = (
            f"User profile: age={profile.get('age', 'unknown')}, "
            f"income={profile.get('income', 'unknown')}, "
            f"dependents={profile.get('dependents', 0)}, "
            f"existing_policies={profile.get('existing_policies', [])}"
        )
        messages.append({"role": "system", "content": profile_ctx})

    for turn in history[-10:]:  # keep last 10 turns for context
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})
    return messages


def get_insurance_advice(uid: str, message: str, history: list, profile: dict) -> dict:
    client = _get_client()
    messages = _build_messages(message, history, profile)

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=1800,
            temperature=0.4,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
    except Exception as e:
        if "json_validate_failed" in str(e) or "400" in str(e):
            logger.warning("Groq JSON mode failed, retrying without response_format: %s", e)
            response = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                max_tokens=1800,
                temperature=0.4,
            )
            content = response.choices[0].message.content
        else:
            raise

    try:
        parsed = json.loads(content)
        return {"reply": parsed.get("reply", ""), "suggestions": parsed.get("suggestions", [])}
    except json.JSONDecodeError:
        return {"reply": content.strip(), "suggestions": []}

def summarize_conversation(history: list) -> str:
    if not history:
        return ""

    client = _get_client()
    turns = "\n".join(
        f"{t['role'].upper()}: {t['content']}" for t in history if t.get("content")
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "Summarize this insurance advisory conversation in 3–5 bullet points. Be concise. Return plain text only.",
            },
            {"role": "user", "content": turns},
        ],
        max_tokens=200,
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()