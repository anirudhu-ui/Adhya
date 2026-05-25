import os
import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass
from flask import Flask, jsonify
from flask_cors import CORS
from flask_talisman import Talisman
from extensions import limiter


def create_app():
    app = Flask(__name__)

    allowed_origins = os.environ.get(
        "ALLOWED_ORIGINS", "http://localhost:5173"
    ).split(",")
    CORS(
        app,
        origins=allowed_origins,
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        max_age=600,
    )

    is_dev = os.environ.get("FLASK_ENV", "production") == "development"
    Talisman(
        app,
        force_https=False,
        strict_transport_security=not is_dev,
        strict_transport_security_max_age=31536000,
        content_security_policy={
    "default-src": ["'self'"],

    "script-src": [
        "'self'",
        "'unsafe-inline'",
        "https://apis.google.com",
        "https://accounts.google.com",
        "https://www.gstatic.com",
    ],

    "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
    ],

    "font-src": [
        "'self'",
        "https://fonts.gstatic.com",
        "https://api.fontshare.com",
    ],

    "connect-src": [
        "'self'",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://firestore.googleapis.com",
        "https://apis.google.com",
    ],

    "img-src": [
        "'self'",
        "data:",
        "https:",
    ],

    "frame-src": [
        "https://accounts.google.com",
    ],

    "frame-ancestors": ["'none'"],
}
        referrer_policy="strict-origin-when-cross-origin",
        content_security_policy_nonce_in=["script-src"],
    )

    limiter.init_app(app)

    from routes.health import health_bp
    from routes.advisor import advisor_bp
    from routes.user import user_bp
    from routes.subscription import subscription_bp
    from routes.chats import chats_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(advisor_bp, url_prefix="/api/advisor")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(subscription_bp, url_prefix="/api/subscription")
    app.register_blueprint(chats_bp, url_prefix="/api/chats")

    @app.errorhandler(429)
    def rate_limit_exceeded(e):
        return jsonify({
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please slow down.",
        }), 429

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "bad_request"}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({"error": "unauthorized"}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "not_found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "internal_server_error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
