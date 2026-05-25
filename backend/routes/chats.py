import re
import logging
from flask import Blueprint, request, jsonify
from extensions import limiter
from services.chat_service import (
    save_chat_session,
    list_chat_sessions,
    get_chat_session,
    delete_chat_session,
)
from utils.auth_middleware import require_firebase_token

logger = logging.getLogger(__name__)
chats_bp = Blueprint("chats", __name__)

SESSION_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{1,64}$")


@chats_bp.route("", methods=["GET"])
@limiter.limit("30 per minute")
@require_firebase_token
def list_sessions(uid):
    try:
        sessions = list_chat_sessions(uid)
        return jsonify({"sessions": sessions}), 200
    except Exception as e:
        logger.error("list_sessions error uid=%.8s: %s", uid, e)
        return jsonify({"error": "fetch_failed"}), 503


@chats_bp.route("/<session_id>", methods=["GET"])
@limiter.limit("30 per minute")
@require_firebase_token
def get_session(uid, session_id):
    if not SESSION_ID_RE.match(session_id):
        return jsonify({"error": "invalid_session_id"}), 400
    try:
        session = get_chat_session(uid, session_id)
        if not session:
            return jsonify({"error": "not_found"}), 404
        return jsonify(session), 200
    except Exception as e:
        logger.error("get_session error uid=%.8s sid=%s: %s", uid, session_id, e)
        return jsonify({"error": "fetch_failed"}), 503


@chats_bp.route("", methods=["POST"])
@limiter.limit("30 per minute")
@require_firebase_token
def save_session(uid):
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "invalid_body"}), 400

    session_id = data.get("session_id", "")
    if not session_id or not SESSION_ID_RE.match(session_id):
        return jsonify({"error": "invalid_session_id"}), 400

    title = str(data.get("title", "Untitled"))[:120]
    messages = data.get("messages", [])
    if not isinstance(messages, list):
        return jsonify({"error": "messages must be array"}), 400

    safe_messages = []
    for m in messages[:200]:
        if isinstance(m, dict) and m.get("role") in ("user", "assistant"):
            safe_messages.append({
                "role": m["role"],
                "content": str(m.get("content", ""))[:4000],
                "timestamp": str(m.get("timestamp", "")),
            })

    try:
        result = save_chat_session(uid, session_id, title, safe_messages)
        return jsonify(result), 200
    except Exception as e:
        logger.error("save_session error uid=%.8s: %s", uid, e)
        return jsonify({"error": "save_failed"}), 503


@chats_bp.route("/<session_id>", methods=["DELETE"])
@limiter.limit("20 per minute")
@require_firebase_token
def delete_session(uid, session_id):
    if not SESSION_ID_RE.match(session_id):
        return jsonify({"error": "invalid_session_id"}), 400
    try:
        deleted = delete_chat_session(uid, session_id)
        if not deleted:
            return jsonify({"error": "not_found"}), 404
        return jsonify({"deleted": session_id}), 200
    except Exception as e:
        logger.error("delete_session error uid=%.8s sid=%s: %s", uid, session_id, e)
        return jsonify({"error": "delete_failed"}), 503
