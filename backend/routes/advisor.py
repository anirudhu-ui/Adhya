import logging
from flask import Blueprint, request, jsonify
from extensions import limiter
from services.advisor_service import get_insurance_advice, summarize_conversation
from services.subscription_service import check_and_increment_message
from utils.auth_middleware import require_firebase_token
from utils.security import (
    sanitize_text,
    sanitize_history,
    sanitize_profile,
    MAX_MESSAGE_LEN,
)

logger = logging.getLogger(__name__)
advisor_bp = Blueprint("advisor", __name__)


@advisor_bp.route("/chat", methods=["POST"])
@limiter.limit("20 per minute; 200 per hour")
@require_firebase_token
def chat(uid):
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "invalid_body"}), 400

    raw_message = data.get("message", "")
    if not raw_message or not isinstance(raw_message, str):
        return jsonify({"error": "message is required"}), 400

    message = sanitize_text(raw_message, MAX_MESSAGE_LEN)
    if not message:
        return jsonify({"error": "message is empty after sanitisation"}), 422

    # ── Daily usage gate (atomic) ─────────────────────────────────────────
    usage = check_and_increment_message(uid)
    if not usage["allowed"]:
        return jsonify({
            "error": "message_limit_reached",
            "limit": usage["limit"],
            "message": "You've used all 10 messages for today. Come back tomorrow!",
        }), 429

    history = sanitize_history(data.get("history", []))
    profile = sanitize_profile(data.get("profile", {}))

    try:
        result = get_insurance_advice(uid, message, history, profile)
        # Attach remaining so frontend counter stays accurate
        result["usage"] = {
            "remaining": usage["remaining"],
            "limit": usage["limit"],
        }
        return jsonify(result), 200
    except RuntimeError as e:
        # Misconfiguration — missing API key etc.
        logger.error("Advisor config error uid=%.8s: %s", uid, e)
        return jsonify({"error": "advisor_unavailable", "reason": "configuration"}), 503
    except Exception as e:
        err_str = str(e)
        # Groq rate-limit passes through as an exception — surface it cleanly
        if "rate_limit" in err_str.lower() or "429" in err_str:
            logger.warning("Groq rate limit hit uid=%.8s: %s", uid, e)
            return jsonify({"error": "advisor_unavailable", "reason": "rate_limit"}), 503
        logger.error("Groq advisor error uid=%.8s: %s", uid, e)
        return jsonify({"error": "advisor_unavailable", "reason": "upstream"}), 503


@advisor_bp.route("/plans", methods=["GET"])
@limiter.limit("20 per minute")
@require_firebase_token
def get_plans(uid):
    from services.user_service import get_user_profile
    from services.plans_service import fetch_personalized_plans

    try:
        profile_data = get_user_profile(uid)
        profile = profile_data.get("profile", {})
        plans = fetch_personalized_plans(profile)
        return jsonify({"plans": plans, "personalized": bool(profile)}), 200
    except Exception as e:
        logger.error("Plans fetch error uid=%.8s: %s", uid, e)
        return jsonify({"error": "plans_unavailable"}), 503


@advisor_bp.route("/summary", methods=["POST"])
@limiter.limit("10 per minute")
@require_firebase_token
def get_summary(uid):
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "invalid_body"}), 400

    history = sanitize_history(data.get("history", []))
    if not history:
        return jsonify({"error": "history is required"}), 400

    try:
        summary = summarize_conversation(history)
        return jsonify({"summary": summary}), 200
    except Exception as e:
        logger.error("Summary error uid=%.8s: %s", uid, e)
        return jsonify({"error": "summary_unavailable"}), 503