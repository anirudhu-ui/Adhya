import os
import json
from groq import Groq

MODEL = "llama-3.1-8b-instant"

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


SYSTEM_PROMPT = """You are Adhya, a professional AI insurance advisor. Your role is to help users:
- Understand insurance products (health, life, vehicle, property)
- Compare plans and coverage options
- Estimate appropriate coverage for their life stage and income
- Simplify complex policy terms into plain language
- Guide users through the claims process

Tone: Concise, confident, and trustworthy. Never alarmist.
Format: Keep responses under 150 words unless the user asks for detail.
Constraints:
- Do NOT give specific legal or tax advice.
- Always recommend consulting a licensed advisor for final decisions.
- When uncertain, say so clearly.
- If the user's profile data is provided, personalize your advice.

After each response, suggest 2–3 relevant follow-up questions the user might have.
Always respond in valid JSON only — no markdown, no preamble:
{ "reply": "...", "suggestions": ["...", "...", "..."] }
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

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        max_tokens=400,
        temperature=0.4,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    try:
        parsed = json.loads(content)
        return {
            "reply": parsed.get("reply", ""),
            "suggestions": parsed.get("suggestions", []),
        }
    except json.JSONDecodeError:
        return {"reply": content, "suggestions": []}


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
