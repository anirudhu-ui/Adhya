import os
from flask import Blueprint, jsonify
from extensions import limiter

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
@limiter.limit("60 per minute")
def health_check():
    return jsonify({"status": "ok", "service": "Adhya AI Advisor API"}), 200


@health_bp.route("/health/debug", methods=["GET"])
@limiter.limit("20 per minute")
def health_debug():
    if os.environ.get("FLASK_ENV") != "development":
        return jsonify({"error": "not_found"}), 404

    checks = {
        "GROQ_API_KEY":             bool(os.environ.get("GROQ_API_KEY")),
        "FIREBASE_PROJECT_ID":      bool(os.environ.get("FIREBASE_PROJECT_ID")),
        "FIREBASE_PRIVATE_KEY":     bool(os.environ.get("FIREBASE_PRIVATE_KEY")),
        "FIREBASE_CLIENT_EMAIL":    bool(os.environ.get("FIREBASE_CLIENT_EMAIL")),
        "FIREBASE_PRIVATE_KEY_ID":  bool(os.environ.get("FIREBASE_PRIVATE_KEY_ID")),
        "FIREBASE_CLIENT_ID":       bool(os.environ.get("FIREBASE_CLIENT_ID")),
        "FLASK_ENV":                os.environ.get("FLASK_ENV", "(not set)"),
        "ALLOWED_ORIGINS":          os.environ.get("ALLOWED_ORIGINS", "(not set)"),
    }
    all_ok = all(v is True for k, v in checks.items()
                 if k not in ("FLASK_ENV", "ALLOWED_ORIGINS"))
    return jsonify({
        "env_vars_present": checks,
        "all_required_set": all_ok,
        "hint": "false = that variable is missing from your backend/.env file" if not all_ok else "All required env vars are set.",
    }), 200 if all_ok else 500
