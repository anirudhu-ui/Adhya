"""
auth_middleware.py

Verifies Firebase ID tokens on every protected route.

Security hardening applied:
- Header presence + format validation before parsing
- Token size cap (prevents oversized-token DoS)
- Only uid is extracted; never trust other claims without re-validation
- Exception detail is NOT forwarded to the client (avoids info leakage)
- Errors ARE logged server-side for debugging
"""

import logging
from functools import wraps
from flask import request, jsonify
from services.firebase_service import verify_token

logger = logging.getLogger(__name__)

_MAX_TOKEN_BYTES = 4_096   # Firebase JWTs are ~1–2 KB; 4 KB is a safe ceiling


def require_firebase_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        # 1. Format check
        if not auth_header.startswith("Bearer "):
            logger.warning("Missing or malformed Authorization header")
            return jsonify({"error": "authorization_required"}), 401

        token = auth_header[len("Bearer "):].strip()

        # 2. Size guard — reject obviously malformed / attack payloads
        if not token or len(token.encode()) > _MAX_TOKEN_BYTES:
            logger.warning("Token missing or exceeds size limit")
            return jsonify({"error": "invalid_token"}), 401

        # 3. Verify signature + expiry via Firebase Admin SDK
        try:
            decoded = verify_token(token)
            uid = decoded.get("uid")
            if not uid:
                raise ValueError("uid missing from token claims")
        except Exception as e:
            # Log server-side but never leak detail to caller
            logger.error("Token verification failed: %s", e)
            return jsonify({"error": "invalid_token"}), 401

        return f(uid, *args, **kwargs)

    return decorated
