import os
import firebase_admin
from firebase_admin import credentials, auth, firestore

_app = None
_db = None


def _init_firebase():
    global _app, _db
    if _app is not None:
        return

    cred_dict = {
        "type": "service_account",
        "project_id": os.environ["FIREBASE_PROJECT_ID"],
        "private_key_id": os.environ["FIREBASE_PRIVATE_KEY_ID"],
        "private_key": os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n"),
        "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
        "client_id": os.environ["FIREBASE_CLIENT_ID"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
    cred = credentials.Certificate(cred_dict)
    _app = firebase_admin.initialize_app(cred)
    _db = firestore.client()


def verify_token(id_token: str) -> dict:
    _init_firebase()
    return auth.verify_id_token(id_token)


def get_db():
    _init_firebase()
    return _db
