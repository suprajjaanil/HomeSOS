import hashlib
import os
import secrets
import time
from typing import Optional

# Secret key for simple HMAC signing of tokens
SECRET_KEY = os.getenv("SECRET_KEY", "homesos-hackathon-secure-session-key-v2-2026")

def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    )
    return f"{salt}${key.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored salt$hash."""
    try:
        salt, key_hex = stored_hash.split("$")
        key = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False

def generate_session_token(user_id: str) -> str:
    """Generate simple signed session token: user_id:timestamp:signature."""
    ts = int(time.time())
    data = f"{user_id}:{ts}"
    signature = hashlib.sha256(f"{data}:{SECRET_KEY}".encode('utf-8')).hexdigest()[:24]
    return f"{data}:{signature}"

def verify_session_token(token: str) -> Optional[str]:
    """Verify session token and return user_id if valid."""
    try:
        parts = token.split(":")
        if len(parts) != 3:
            return None
        user_id, ts_str, signature = parts
        data = f"{user_id}:{ts_str}"
        expected_sig = hashlib.sha256(f"{data}:{SECRET_KEY}".encode('utf-8')).hexdigest()[:24]
        if secrets.compare_digest(signature, expected_sig):
            return user_id
        return None
    except Exception:
        return None
