"""
extensions.py — Flask extension instances.

Defined here (not in app.py) so that routes can import them
without triggering a circular import through app.py.
"""

import os
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per hour", "30 per minute"],
    storage_uri=os.environ.get("REDIS_URL", "memory://"),
)
