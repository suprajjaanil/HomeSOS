import uuid
import time
from fastapi import APIRouter, HTTPException, Header, Depends, Query
from typing import Optional
from ..database import get_db
from ..models import row_to_user_dict
from ..auth_util import hash_password, verify_password, generate_session_token, verify_session_token
from ..schemas import UserRegisterRequest, UserLoginRequest, UserProfileUpdateRequest, UserResponse, AuthResponse

router = APIRouter(prefix="/api/auth", tags=["Customer Authentication"])

def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Extract and verify user id from Authorization header Bearer token, fallback to demo user."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
        uid = verify_session_token(token)
        if uid:
            return uid
    # Fallback to demo user if unauthenticated or invalid token
    return "user-demo"

@router.post("/register", response_model=AuthResponse)
def register(payload: UserRegisterRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?;", (payload.email.strip().lower(),))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists")

        user_id = f"user-{uuid.uuid4().hex[:10]}"
        pwd_hash = hash_password(payload.password)
        locality = payload.locality or "BTM Layout"
        address = payload.address or ""

        cursor.execute("""
        INSERT INTO users (id, name, email, phone, password_hash, locality, address)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (
            user_id,
            payload.name.strip(),
            payload.email.strip().lower(),
            payload.phone.strip(),
            pwd_hash,
            locality,
            address
        ))
        conn.commit()

        cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        user_row = cursor.fetchone()
        user_dict = row_to_user_dict(user_row)
        token = generate_session_token(user_id)
        return {"user": user_dict, "token": token}

@router.post("/login", response_model=AuthResponse)
def login(payload: UserLoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE email = ?;", (payload.email.strip().lower(),))
        user_row = cursor.fetchone()
        if not user_row:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not verify_password(payload.password, user_row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_dict = row_to_user_dict(user_row)
        token = generate_session_token(user_row["id"])
        return {"user": user_dict, "token": token}

@router.get("/me", response_model=UserResponse)
def get_me(authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            cursor.execute("SELECT * FROM users WHERE id = 'user-demo';")
            user_row = cursor.fetchone()
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")
        return row_to_user_dict(user_row)

@router.put("/profile", response_model=UserResponse)
def update_profile(payload: UserProfileUpdateRequest, authorization: Optional[str] = Header(None)):
    user_id = get_current_user_id(authorization)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")

        name = payload.name if payload.name is not None else user_row["name"]
        phone = payload.phone if payload.phone is not None else user_row["phone"]
        locality = payload.locality if payload.locality is not None else user_row["locality"]
        address = payload.address if payload.address is not None else user_row["address"]

        cursor.execute("""
        UPDATE users SET name = ?, phone = ?, locality = ?, address = ?
        WHERE id = ?;
        """, (name, phone, locality, address, user_id))
        conn.commit()

        cursor.execute("SELECT * FROM users WHERE id = ?;", (user_id,))
        updated_row = cursor.fetchone()
        return row_to_user_dict(updated_row)
