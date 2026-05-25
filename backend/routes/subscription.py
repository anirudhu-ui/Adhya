import logging
from flask import Blueprint, jsonify
from extensions import limiter
from services.subscription_service import get_subscription_status
from utils.auth_middleware import require_firebase_token

logger = logging.getLogger(__name__)
subscription_bp = Blueprint("subscription", __name__)


@subscription_bp.route("/status", methods=["GET"])
@limiter.limit("60 per minute")
@require_firebase_token
def status(uid):
    try:
        data = get_subscription_status(uid)
        return jsonify(data), 200
    except Exception as e:
        logger.error("subscription status error uid=%.8s: %s", uid, e)
        return jsonify({"error": "status_unavailable"}), 503
