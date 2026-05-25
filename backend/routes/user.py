from flask import Blueprint, request, jsonify
from extensions import limiter
from services.user_service import get_user_profile, update_user_profile
from utils.auth_middleware import require_firebase_token
from utils.security import sanitize_profile

user_bp = Blueprint("user", __name__)


@user_bp.route("/profile", methods=["GET"])
@limiter.limit("30 per minute")
@require_firebase_token
def profile(uid):
    try:
        data = get_user_profile(uid)
        return jsonify(data), 200
    except Exception:
        return jsonify({"error": "profile_not_found"}), 404


@user_bp.route("/profile", methods=["PUT"])
@limiter.limit("10 per minute")
@require_firebase_token
def update_profile(uid):
    data = request.get_json(silent=True)
    if not data or not isinstance(data, dict):
        return jsonify({"error": "invalid_body"}), 400

    safe = sanitize_profile(data)
    if not safe:
        return jsonify({"error": "no_valid_fields"}), 422

    try:
        updated = update_user_profile(uid, safe)
        return jsonify(updated), 200
    except Exception:
        return jsonify({"error": "update_failed"}), 500
