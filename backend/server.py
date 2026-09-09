from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import asyncio
import logging
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import resend
import httpx
import hashlib
from bson import ObjectId
from pymongo import UpdateOne
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger


# ---------- Config ----------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev-secret-change-me')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@fashioninterior.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'FashionAdmin@2025')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
NOTIFY_EMAIL = os.environ.get('NOTIFY_EMAIL', ADMIN_EMAIL).strip()
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY', '').strip()
GOOGLE_PLACE_ID = os.environ.get('GOOGLE_PLACE_ID', '').strip()
SERPAPI_KEY = os.environ.get('SERPAPI_KEY', '').strip()
JWT_ALG = "HS256"

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("fashion-interior")

# ---------- DB ----------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
gridfs = AsyncIOMotorGridFSBucket(db, bucket_name="uploads")


def _abs_base(request: Request) -> str:
    """Return the public-facing base URL the user is hitting.

    Honours X-Forwarded-Proto / X-Forwarded-Host (set by ingress / Cloudflare /
    any reverse proxy) so URLs always match the user's browser address bar
    even when uvicorn isn't started with --proxy-headers.
    """
    fwd_host = request.headers.get("x-forwarded-host")
    fwd_proto = request.headers.get("x-forwarded-proto")
    host = (fwd_host.split(",")[0].strip() if fwd_host else request.url.netloc)
    scheme = (fwd_proto.split(",")[0].strip() if fwd_proto else request.url.scheme)
    return f"{scheme}://{host}".rstrip("/")

# ---------- App ----------
app = FastAPI(title="Urban Interiors API")
api = APIRouter(prefix="/api")


# ---------- Helpers ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id, "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user or user.get("role") != "admin":
            raise HTTPException(status_code=401, detail="Not authorized")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Email (Resend) ----------
def render_reset_email(reset_link: str) -> str:
    return f"""
    <!DOCTYPE html><html><body style="margin:0;padding:0;background:#161616;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#161616;padding:48px 16px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#1d1d1d;border-radius:12px;overflow:hidden;border:1px solid rgba(203,161,83,0.2);">
            <tr><td style="padding:40px 40px 24px 40px;border-bottom:1px solid rgba(203,161,83,0.18);">
              <div style="font-family:Georgia,'Playfair Display',serif;font-size:28px;color:#CBA153;letter-spacing:0.5px;">Urban Interiors</div>
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8a8a8a;margin-top:6px;">Kolkata · Chinar Park</div>
            </td></tr>
            <tr><td style="padding:36px 40px;color:#F9F8F6;">
              <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:30px;font-weight:400;margin:0 0 16px 0;color:#F9F8F6;letter-spacing:-0.5px;">Reset your password</h1>
              <p style="font-size:15px;line-height:1.7;color:#cfcfcf;margin:0 0 28px 0;">
                We received a request to reset the password for your Urban Interiors admin account.
                Click the button below to set a new password. This link will expire in 60 minutes.
              </p>
              <table cellpadding="0" cellspacing="0"><tr><td style="border-radius:2px;background:#CBA153;">
                <a href="{reset_link}" style="display:inline-block;padding:14px 32px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#161616;font-weight:600;text-decoration:none;">Reset Password</a>
              </td></tr></table>
              <p style="font-size:13px;line-height:1.7;color:#8a8a8a;margin:32px 0 0 0;">
                If you didn't request this, you can safely ignore this email — your password will remain unchanged.
              </p>
              <p style="font-size:12px;color:#6a6a6a;margin:24px 0 0 0;word-break:break-all;">Or copy this link:<br/>{reset_link}</p>
            </td></tr>
            <tr><td style="padding:24px 40px;border-top:1px solid rgba(203,161,83,0.18);background:#141414;">
              <div style="font-size:11px;color:#6a6a6a;line-height:1.7;">
                Urban Interiors · 211 Road, Chinar Park, Near Bharat Petroleum, Atghara, Tegharia, Newtown, Kolkata 700136<br/>
                © 2025 Urban Interiors. All Rights Reserved.
              </div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>
    """


async def send_reset_email(to_email: str, reset_link: str) -> bool:
    if not RESEND_API_KEY:
        logger.warning(f"[Resend NOT configured] Password reset link for {to_email}: {reset_link}")
        return False
    params = {
        "from": f"Urban Interiors <{SENDER_EMAIL}>",
        "to": [to_email],
        "subject": "Reset your Urban Interiors admin password",
        "html": render_reset_email(reset_link),
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Resend failed: {e}. Reset link: {reset_link}")
        return False


def render_lead_email(inq: dict) -> str:
    def esc(v: str) -> str:
        return (str(v) if v is not None else "—").replace("<", "&lt;").replace(">", "&gt;")
    return f"""
    <!DOCTYPE html><html><body style="margin:0;padding:0;background:#161616;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#161616;padding:48px 16px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#1d1d1d;border-radius:12px;overflow:hidden;border:1px solid rgba(203,161,83,0.2);">
            <tr><td style="padding:36px 40px 18px 40px;border-bottom:1px solid rgba(203,161,83,0.18);">
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#CBA153;">New Inquiry</div>
              <div style="font-family:Georgia,'Playfair Display',serif;font-size:26px;color:#F9F8F6;margin-top:8px;letter-spacing:-0.3px;">{esc(inq.get('name'))} just enquired</div>
            </td></tr>
            <tr><td style="padding:30px 40px;color:#F9F8F6;">
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#cfcfcf;">
                <tr><td style="padding:6px 0;color:#8a8a8a;width:140px;">Phone</td><td style="padding:6px 0;"><a href="tel:{esc(inq.get('phone'))}" style="color:#CBA153;text-decoration:none;">{esc(inq.get('phone'))}</a></td></tr>
                <tr><td style="padding:6px 0;color:#8a8a8a;">Email</td><td style="padding:6px 0;"><a href="mailto:{esc(inq.get('email'))}" style="color:#CBA153;text-decoration:none;">{esc(inq.get('email'))}</a></td></tr>
                <tr><td style="padding:6px 0;color:#8a8a8a;">Service</td><td style="padding:6px 0;color:#F9F8F6;">{esc(inq.get('service') or '—')}</td></tr>
                <tr><td style="padding:6px 0;color:#8a8a8a;">Callback time</td><td style="padding:6px 0;color:#F9F8F6;">{esc(inq.get('callback_time') or '—')}</td></tr>
              </table>
              <div style="margin-top:24px;padding:18px 20px;background:#141414;border-left:2px solid #CBA153;font-size:14px;line-height:1.7;color:#dcdcdc;white-space:pre-wrap;">{esc(inq.get('message'))}</div>
              <div style="margin-top:28px;">
                <a href="tel:{esc(inq.get('phone'))}" style="display:inline-block;padding:12px 24px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#161616;background:#CBA153;font-weight:600;text-decoration:none;border-radius:2px;margin-right:8px;">Call back</a>
                <a href="https://wa.me/91{esc(inq.get('phone','')).lstrip('0').replace(' ','')}" style="display:inline-block;padding:12px 24px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F9F8F6;border:1px solid rgba(255,255,255,0.4);font-weight:500;text-decoration:none;border-radius:2px;">WhatsApp</a>
              </div>
            </td></tr>
            <tr><td style="padding:18px 40px;border-top:1px solid rgba(203,161,83,0.18);background:#141414;">
              <div style="font-size:11px;color:#6a6a6a;line-height:1.7;">
                Urban Interiors · 211 Road, Chinar Park, Near Bharat Petroleum, Atghara, Tegharia, Newtown, Kolkata 700136<br/>
                Submitted at {esc(inq.get('created_at'))}
              </div>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body></html>
    """


async def send_lead_email(inq: dict) -> bool:
    if not RESEND_API_KEY or not NOTIFY_EMAIL:
        logger.info(f"[Lead notify skipped] {inq.get('name')} / {inq.get('phone')} — RESEND not configured")
        return False
    params = {
        "from": f"Urban Interiors Leads <{SENDER_EMAIL}>",
        "to": [NOTIFY_EMAIL],
        "reply_to": inq.get("email") or SENDER_EMAIL,
        "subject": f"New inquiry — {inq.get('name')} ({inq.get('service') or 'general'})",
        "html": render_lead_email(inq),
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Lead notification sent to {NOTIFY_EMAIL} for inquiry {inq.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Lead Resend failed: {e}")
        return False


# ---------- Google Reviews auto-sync ----------
def _review_fingerprint(name: str, text: str) -> str:
    """Stable hash so the same Google review is never seeded twice."""
    content = f"{(name or '').strip().lower()}::{(text or '').strip().lower()[:120]}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


async def _fetch_reviews_serpapi() -> tuple[list, dict]:
    """Fetch reviews via SerpAPI (free tier, no payment method required)."""
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_maps_reviews",
        "place_id": GOOGLE_PLACE_ID,
        "api_key": SERPAPI_KEY,
        "sort_by": "newestFirst",
        "hl": "en",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()
    reviews_raw = data.get("reviews", []) or []
    place_info = data.get("place_info", {}) or {}
    normalized = []
    for r in reviews_raw:
        normalized.append({
            "name": (r.get("user") or {}).get("name") or r.get("author_name") or "Google reviewer",
            "rating": int(r.get("rating") or 5),
            "text": r.get("snippet") or r.get("description") or "",
            "when": r.get("date") or r.get("published_at_date") or "",
            "is_local_guide": ((r.get("user") or {}).get("local_guide") is True),
            "review_count": ((r.get("user") or {}).get("reviews") or None),
        })
    meta = {"rating": place_info.get("rating"), "review_count": place_info.get("reviews")}
    return normalized, meta


async def _fetch_reviews_google_places() -> tuple[list, dict]:
    """Fetch reviews via official Google Places API (New). Requires billing."""
    url = f"https://places.googleapis.com/v1/places/{GOOGLE_PLACE_ID}"
    headers = {
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "id,rating,userRatingCount,reviews",
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        data = resp.json()
    reviews_raw = data.get("reviews", []) or []
    normalized = []
    for r in reviews_raw:
        author = r.get("authorAttribution") or {}
        text_obj = r.get("text") or r.get("originalText") or {}
        text = text_obj.get("text") if isinstance(text_obj, dict) else (text_obj or "")
        normalized.append({
            "name": author.get("displayName") or "Google reviewer",
            "rating": int(r.get("rating") or 5),
            "text": text or "",
            "when": r.get("relativePublishTimeDescription") or "",
            "is_local_guide": False,
            "review_count": None,
        })
    meta = {"rating": data.get("rating"), "review_count": data.get("userRatingCount")}
    return normalized, meta


async def sync_google_reviews() -> dict:
    """
    Sync Google reviews into the testimonials collection. Uses SerpAPI when a
    SERPAPI_KEY is set (free, no credit card), otherwise falls back to the
    official Google Places API (requires billing).
    """
    status = {
        "configured": False,
        "provider": None,
        "fetched": 0, "added": 0, "updated": 0,
        "error": None,
        "ran_at": datetime.now(timezone.utc).isoformat(),
    }
    has_serp = bool(SERPAPI_KEY and GOOGLE_PLACE_ID)
    has_google = bool(GOOGLE_MAPS_API_KEY and GOOGLE_PLACE_ID)
    if not has_serp and not has_google:
        status["error"] = "Set SERPAPI_KEY (free, no credit card) OR GOOGLE_MAPS_API_KEY in backend/.env — plus GOOGLE_PLACE_ID — and restart the backend."
        await db.system.update_one({"id": "google_sync"}, {"$set": status | {"id": "google_sync"}}, upsert=True)
        return status
    status["configured"] = True
    status["provider"] = "serpapi" if has_serp else "google_places"

    try:
        if has_serp:
            normalized, meta = await _fetch_reviews_serpapi()
        else:
            normalized, meta = await _fetch_reviews_google_places()
    except httpx.HTTPStatusError as e:
        body = e.response.text[:300] if e.response is not None else ""
        status["error"] = f"{status['provider']} HTTP {e.response.status_code}: {body}"
        logger.error(status["error"])
        await db.system.update_one({"id": "google_sync"}, {"$set": status | {"id": "google_sync"}}, upsert=True)
        return status
    except Exception as e:
        status["error"] = f"{status['provider']} error: {e}"
        logger.error(status["error"])
        await db.system.update_one({"id": "google_sync"}, {"$set": status | {"id": "google_sync"}}, upsert=True)
        return status

    status["fetched"] = len(normalized)
    base_order = await db.testimonials.count_documents({})
    new_order = base_order

    for rev in normalized:
        fp = _review_fingerprint(rev["name"], rev["text"])
        existing = await db.testimonials.find_one({"google_fingerprint": fp})
        if existing:
            await db.testimonials.update_one(
                {"google_fingerprint": fp},
                {"$set": {**rev, "source": "google", "last_synced": status["ran_at"]}},
            )
            status["updated"] += 1
        else:
            await db.testimonials.insert_one({
                "id": str(uuid.uuid4()),
                **rev,
                "order": new_order,
                "source": "google",
                "google_fingerprint": fp,
                "last_synced": status["ran_at"],
            })
            status["added"] += 1
            new_order += 1

    status["place_rating"] = meta.get("rating")
    status["place_review_count"] = meta.get("review_count")
    await db.system.update_one({"id": "google_sync"}, {"$set": status | {"id": "google_sync"}}, upsert=True)
    logger.info(f"Google sync done ({status['provider']}): {status}")
    return status


# ---------- Models ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class ChangeEmailIn(BaseModel):
    current_password: str
    new_email: EmailStr


class PortfolioIn(BaseModel):
    title: str
    category: str
    description: str = ""
    image_url: str
    aspect: Optional[str] = "portrait"  # "portrait" | "landscape" | "square"


class PortfolioOut(PortfolioIn):
    id: str
    order: int = 0
    created_at: str


class TestimonialIn(BaseModel):
    name: str
    rating: int = 5
    text: str
    when: str = ""
    is_local_guide: bool = False
    review_count: Optional[int] = None


class TestimonialOut(TestimonialIn):
    id: str
    order: int = 0


class InquiryIn(BaseModel):
    name: str
    phone: str
    email: EmailStr
    service: Optional[str] = ""
    message: str
    callback_time: Optional[str] = ""


class InquiryOut(InquiryIn):
    id: str
    created_at: str
    is_read: bool = False


class ReorderIn(BaseModel):
    ids: List[str]


class BusinessInfoIn(BaseModel):
    business_name: str = "Urban Interiors"
    address: str = "211 Road, Chinar Park, Near Bharat Petroleum, Atghara, Tegharia, Newtown, Kolkata, West Bengal 700136"
    secondary_address: str = "Kaikhali, KNI Avenue, Near Indraprastha Complex, Kolkata 700052"
    phone: str = "8981230518"
    whatsapp: str = "8981230518"
    email: str = "urban.interiors.kol@gmail.com"
    hours: str = "Everyday · 24 hours open"
    instagram: str = "https://www.instagram.com/urban.interiors.kol?igsh=MTdrNWFiOTFiamdncA=="
    facebook: str = ""
    google_maps_url: str = "https://maps.google.com/?q=Urban+Interiors+Chinar+Park+Kolkata"


# ---------- Public routes ----------
@api.get("/")
async def root():
    return {"message": "Urban Interiors API", "status": "ok"}


@api.get("/portfolio", response_model=List[PortfolioOut])
async def list_portfolio():
    docs = await db.portfolio.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return docs


@api.get("/testimonials", response_model=List[TestimonialOut])
async def list_testimonials():
    docs = await db.testimonials.find({}, {"_id": 0}).sort("order", 1).to_list(500)
    return docs


@api.get("/business-info")
async def get_business_info():
    doc = await db.business_info.find_one({"id": "main"}, {"_id": 0})
    if not doc:
        return BusinessInfoIn().model_dump()
    return doc


@api.post("/inquiries", response_model=InquiryOut)
async def create_inquiry(payload: InquiryIn):
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["is_read"] = False
    await db.inquiries.insert_one(doc)
    # Fire-and-forget lead notification (don't block the response if Resend is slow)
    asyncio.create_task(send_lead_email(doc))
    return {k: v for k, v in doc.items() if k != "_id"}


# ---------- Admin auth ----------
@api.post("/admin/login")
async def admin_login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not an admin account")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True,
        secure=True, samesite="none", max_age=60 * 60 * 12, path="/"
    )
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": "admin", "access_token": token}


@api.post("/admin/logout")
async def admin_logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/admin/me")
async def admin_me(user: dict = Depends(get_current_admin)):
    return {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin"), "role": "admin"}


@api.post("/admin/forgot-password")
async def admin_forgot(request: Request, payload: ForgotIn):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    # Always return success to prevent enumeration
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": user["id"],
            "email": email,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        reset_link = f"{_abs_base(request)}/admin/reset-password?token={token}"
        await send_reset_email(email, reset_link)
    return {"ok": True, "message": "If that email is registered, a reset link has been sent."}


@api.post("/admin/reset-password")
async def admin_reset(payload: ResetIn):
    rec = await db.password_reset_tokens.find_one({"token": payload.token})
    if not rec or rec.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    expires_at = rec.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at is not None and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at is None or expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token has expired")
    new_hash = hash_password(payload.new_password)
    # Persist the new hash AND mark the user as having a custom password so
    # the startup seed_admin() heuristic never overwrites it on redeploy.
    await db.users.update_one(
        {"id": rec["user_id"]},
        {"$set": {
            "password_hash": new_hash,
            "password_changed": True,
            "password_changed_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    await db.password_reset_tokens.update_one({"token": payload.token}, {"$set": {"used": True}})
    logger.info(f"Admin password reset via token for user_id={rec['user_id']}")
    return {"ok": True, "message": "Password updated successfully"}


@api.post("/admin/change-password")
async def admin_change_password(payload: ChangePasswordIn, user: dict = Depends(get_current_admin)):
    full = await db.users.find_one({"id": user["id"]})
    if not full or not verify_password(payload.current_password, full["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    # Persist the new hash AND mark the user as having a custom password so
    # the startup seed_admin() heuristic never overwrites it on redeploy.
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "password_hash": hash_password(payload.new_password),
            "password_changed": True,
            "password_changed_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    logger.info(f"Admin password changed for user_id={user['id']}")
    return {"ok": True}


@api.post("/admin/change-email")
async def admin_change_email(payload: ChangeEmailIn, user: dict = Depends(get_current_admin)):
    full = await db.users.find_one({"id": user["id"]})
    if not full or not verify_password(payload.current_password, full["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    new_email = payload.new_email.lower().strip()
    existing = await db.users.find_one({"email": new_email})
    if existing and existing.get("id") != user["id"]:
        raise HTTPException(status_code=400, detail="Email already in use")
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "email": new_email,
            "email_changed": True,
            "email_changed_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    logger.info(f"Admin email changed for user_id={user['id']}")
    return {"ok": True, "email": new_email}


# ---------- Admin: Portfolio ----------
@api.get("/admin/portfolio")
async def admin_list_portfolio(user: dict = Depends(get_current_admin)):
    docs = await db.portfolio.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return docs


@api.post("/admin/portfolio")
async def admin_create_portfolio(payload: PortfolioIn, user: dict = Depends(get_current_admin)):
    count = await db.portfolio.count_documents({})
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["order"] = count
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.portfolio.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api.put("/admin/portfolio/{item_id}")
async def admin_update_portfolio(item_id: str, payload: PortfolioIn, user: dict = Depends(get_current_admin)):
    update = payload.model_dump()
    res = await db.portfolio.update_one({"id": item_id}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    doc = await db.portfolio.find_one({"id": item_id}, {"_id": 0})
    return doc


@api.delete("/admin/portfolio/{item_id}")
async def admin_delete_portfolio(item_id: str, user: dict = Depends(get_current_admin)):
    res = await db.portfolio.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}


@api.post("/admin/portfolio/reorder")
async def admin_reorder_portfolio(payload: ReorderIn, user: dict = Depends(get_current_admin)):
    if not payload.ids:
        return {"ok": True}
    ops = [UpdateOne({"id": item_id}, {"$set": {"order": idx}}) for idx, item_id in enumerate(payload.ids)]
    await db.portfolio.bulk_write(ops)
    return {"ok": True}


# ---------- Admin: Google Reviews sync ----------
@api.get("/admin/google-sync/status")
async def admin_google_sync_status(user: dict = Depends(get_current_admin)):
    doc = await db.system.find_one({"id": "google_sync"}, {"_id": 0})
    has_serp = bool(SERPAPI_KEY and GOOGLE_PLACE_ID)
    has_google = bool(GOOGLE_MAPS_API_KEY and GOOGLE_PLACE_ID)
    return {
        "configured": has_serp or has_google,
        "provider": "serpapi" if has_serp else ("google_places" if has_google else None),
        "place_id": GOOGLE_PLACE_ID or "",
        "last_run": doc or {"ran_at": None, "fetched": 0, "added": 0, "updated": 0, "error": None},
    }


@api.post("/admin/google-sync/run")
async def admin_google_sync_run(user: dict = Depends(get_current_admin)):
    return await sync_google_reviews()


# ---------- Uploads (GridFS — survives every redeploy) ----------
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
CONTENT_TYPE_BY_EXT = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".webp": "image/webp", ".gif": "image/gif",
}
MAX_UPLOAD_BYTES = 12 * 1024 * 1024  # 12 MB


@api.post("/admin/upload")
async def admin_upload(request: Request, file: UploadFile = File(...), user: dict = Depends(get_current_admin)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXT:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use JPG, PNG, WebP or GIF.")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 12 MB)")
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    safe_name = f"{uuid.uuid4().hex}{ext}"
    content_type = CONTENT_TYPE_BY_EXT.get(ext, "application/octet-stream")
    file_id = await gridfs.upload_from_stream(
        safe_name, data, metadata={"content_type": content_type, "uploaded_by": user.get("id")}
    )
    url = f"{_abs_base(request)}/api/uploads/{str(file_id)}"
    return {"url": url, "filename": safe_name, "size": len(data), "id": str(file_id)}


@api.get("/uploads/{file_id}")
async def serve_upload(file_id: str):
    try:
        oid = ObjectId(file_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")
    try:
        grid_out = await gridfs.open_download_stream(oid)
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")
    ct = (grid_out.metadata or {}).get("content_type", "application/octet-stream")

    async def streamer():
        while True:
            chunk = await grid_out.readchunk()
            if not chunk:
                break
            yield chunk

    return StreamingResponse(streamer(), media_type=ct, headers={"Cache-Control": "public, max-age=31536000, immutable"})


# ---------- Admin: Testimonials ----------
@api.get("/admin/testimonials")
async def admin_list_testimonials(user: dict = Depends(get_current_admin)):
    docs = await db.testimonials.find({}, {"_id": 0}).sort("order", 1).to_list(1000)
    return docs


@api.post("/admin/testimonials")
async def admin_create_testimonial(payload: TestimonialIn, user: dict = Depends(get_current_admin)):
    count = await db.testimonials.count_documents({})
    doc = payload.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["order"] = count
    # Mark as manually-added so the stale-seed migration never removes it.
    doc.setdefault("source", "manual")
    await db.testimonials.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api.put("/admin/testimonials/{item_id}")
async def admin_update_testimonial(item_id: str, payload: TestimonialIn, user: dict = Depends(get_current_admin)):
    res = await db.testimonials.update_one({"id": item_id}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    doc = await db.testimonials.find_one({"id": item_id}, {"_id": 0})
    return doc


@api.delete("/admin/testimonials/{item_id}")
async def admin_delete_testimonial(item_id: str, user: dict = Depends(get_current_admin)):
    res = await db.testimonials.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    return {"ok": True}


# ---------- Admin: Inquiries ----------
@api.get("/admin/inquiries")
async def admin_list_inquiries(user: dict = Depends(get_current_admin)):
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return docs


@api.delete("/admin/inquiries/{item_id}")
async def admin_delete_inquiry(item_id: str, user: dict = Depends(get_current_admin)):
    res = await db.inquiries.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"ok": True}


@api.post("/admin/inquiries/{item_id}/read")
async def admin_mark_read(item_id: str, user: dict = Depends(get_current_admin)):
    await db.inquiries.update_one({"id": item_id}, {"$set": {"is_read": True}})
    return {"ok": True}


# ---------- Admin: Business Info ----------
@api.get("/admin/business-info")
async def admin_get_business_info(user: dict = Depends(get_current_admin)):
    doc = await db.business_info.find_one({"id": "main"}, {"_id": 0})
    if not doc:
        return BusinessInfoIn().model_dump()
    return doc


@api.put("/admin/business-info")
async def admin_update_business_info(payload: BusinessInfoIn, user: dict = Depends(get_current_admin)):
    update = payload.model_dump()
    update["id"] = "main"
    await db.business_info.update_one({"id": "main"}, {"$set": update}, upsert=True)
    return update


# ---------- Admin: Stats ----------
@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(get_current_admin)):
    p = await db.portfolio.count_documents({})
    t = await db.testimonials.count_documents({})
    i = await db.inquiries.count_documents({})
    unread = await db.inquiries.count_documents({"is_read": False})
    return {"portfolio_count": p, "testimonials_count": t, "inquiries_count": i, "unread_inquiries": unread}


# ---------- Seed ----------
# Each item uses images the Urban Interiors owner uploaded into the current
# job's artifact bucket (job_aniket-interiors). The startup migration below
# deletes any rows seeded from the OLD Fashion Interior session bucket
# (job_4e352398-ef7d-4f99-8305-24b84c12ade6) so stale demo items can't survive
# a rebrand.
_OLD_SEED_BUCKET = "job_4e352398-ef7d-4f99-8305-24b84c12ade6"
_OLD_SEED_TITLES = [
    "Golden Floral Dining Suite",
    "Rajarhat Living Lounge",
    "Heritage Floral Drawing Room",
    "Stone Accent Sunroom",
    "Striped Canopy Showroom",
]

DEFAULT_PORTFOLIO = [
    {"title": "U-Shape Modular Kitchen", "category": "Kitchen Renovation · Residential",
     "description": "A compact U-shape modular kitchen with profile-lit shutters and quartz counters. Designed for a growing Chinar Park family.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/g68dku5u_IMG-20260501-WA0022.jpg",
     "aspect": "square"},
    {"title": "Modular Kitchen Island", "category": "Kitchen Renovation · Residential",
     "description": "Open-plan kitchen with a full island, warm wood handle-less units and integrated appliances. Perfect for hosting.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/b0q65frj_IMG-20260501-WA0021.jpg",
     "aspect": "square"},
    {"title": "Slat & Greenery Foyer", "category": "Interior Design · Feature Wall",
     "description": "A vertical teak slat wall punctuated by live greenery — a calm, textural welcome into the home.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/1ix5f5nl_IMG-20260501-WA0023.jpg",
     "aspect": "square"},
    {"title": "L-Shaped Modular Kitchen", "category": "Kitchen Renovation · Residential",
     "description": "L-shape modular kitchen paired with a tall fluted feature wall. Soft task lighting makes meal prep effortless.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/p36cxr5m_IMG-20260501-WA0024.jpg",
     "aspect": "square"},
    {"title": "Bright Living Room", "category": "Interior Design · Residential",
     "description": "A sunlit Chinar Park living room finished in warm whites with layered ceiling coves, custom art and plush seating.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/9v7a5ior_IMG-20260501-WA0025.jpg",
     "aspect": "square"},
    {"title": "Slat-Wood TV Wall · Living Room", "category": "Bespoke Furniture · Residential",
     "description": "Full-height slatted wood TV wall with integrated storage and ambient cove lighting. Warm, theatrical, grounded.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/huptrr6c_Screenshot_2026-04-30_175707.jpg",
     "aspect": "square"},
    {"title": "Warm Cove TV Unit", "category": "Bespoke Furniture · Residential",
     "description": "Cove-lit entertainment wall finished in matte wood and warm brass trim. A mature, minimal take on the living-room focal point.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/r476hv2g_Screenshot_2026-04-30_175715.jpg",
     "aspect": "square"},
    {"title": "Master Bedroom with Headboard Wall", "category": "Bespoke Furniture · Residential",
     "description": "A bespoke master bedroom: full upholstered headboard wall, built-in bedside niches and layered warm lighting.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/yppxknu8_Screenshot_2026-04-30_175809.jpg",
     "aspect": "square"},
    {"title": "Skyline Balcony Lounge", "category": "Bespoke Furniture · Outdoor",
     "description": "An intimate balcony lounge with wooden decking, privacy screens and café-style string lights — a Kolkata skyline retreat.",
     "image_url": "https://customer-assets.emergentagent.com/job_aniket-interiors/artifacts/p5pfr4uz_Screenshot_2026-04-30_175814.jpg",
     "aspect": "square"},
]


# After the rebrand to Urban Interiors, real customer reviews are pulled
# from Google Maps via the SerpAPI 12-hourly background sync. We no longer
# auto-seed any fake testimonials. The startup migration in
# seed_testimonials() removes any leftover Fashion Interior seed rows.
DEFAULT_TESTIMONIALS: list = []


async def seed_admin():
    """Ensure an admin user exists without clobbering user-made changes.

    Rules:
      - If NO admin user exists at all (first boot / fresh DB), seed one with
        ADMIN_EMAIL + ADMIN_PASSWORD from env.
      - If ANY admin user exists (even under a different email after a
        change-email), do nothing — preserve their email + password.
      - Legacy behavior: if an admin with the env email exists but never
        changed their password, refresh the hash to match the env (only
        useful when an operator rotates ADMIN_PASSWORD in .env before the
        admin has customised it).
    """
    any_admin = await db.users.find_one({"role": "admin"})
    if any_admin is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user {ADMIN_EMAIL}")
        return

    # ---- Retroactive migration (safe, idempotent) ----
    # If an existing admin's stored hash no longer matches the env ADMIN_PASSWORD,
    # that means they've ALREADY customised it via the dashboard. Stamp the
    # password_changed flag so no future restart ever clobbers it.
    async for u in db.users.find({"role": "admin"}):
        if u.get("password_changed"):
            continue
        if not verify_password(ADMIN_PASSWORD, u.get("password_hash", "")):
            await db.users.update_one(
                {"id": u["id"]},
                {"$set": {
                    "password_changed": True,
                    "password_changed_at": u.get(
                        "password_changed_at",
                        datetime.now(timezone.utc).isoformat(),
                    ),
                }},
            )
            logger.info(
                f"Migration: marked admin user_id={u['id']} as password_changed "
                "(stored hash differs from .env default)"
            )

    # Admin exists — only refresh env-password if the admin has NEVER changed
    # either their password or their email. This protects every
    # /admin/change-password, /admin/reset-password and /admin/change-email
    # call from being silently reverted on the next backend restart.
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower(), "role": "admin"})
    if (
        existing
        and not existing.get("password_changed")
        and not existing.get("email_changed")
        and not verify_password(ADMIN_PASSWORD, existing.get("password_hash", ""))
    ):
        await db.users.update_one(
            {"id": existing["id"]},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )
        logger.info("Refreshed admin password from .env (no custom changes detected)")


async def seed_portfolio():
    # Migration (idempotent): remove any portfolio rows left over from the
    # pre-rebrand "Fashion Interior" default seed. These are identifiable
    # unambiguously by either their image_url (old artifact bucket) or their
    # canonical default title. Runs on every startup so existing deployments
    # silently catch up.
    migration_filter = {
        "$or": [
            {"image_url": {"$regex": _OLD_SEED_BUCKET}},
            {"title": {"$in": _OLD_SEED_TITLES}},
        ]
    }
    result = await db.portfolio.delete_many(migration_filter)
    if result.deleted_count:
        logger.info(
            f"Migration: removed {result.deleted_count} stale Fashion Interior "
            "portfolio rows (old seed bucket / canonical titles)."
        )

    if await db.portfolio.count_documents({}) == 0:
        for idx, p in enumerate(DEFAULT_PORTFOLIO):
            await db.portfolio.insert_one({
                **p,
                "id": str(uuid.uuid4()),
                "order": idx,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        logger.info(f"Seeded {len(DEFAULT_PORTFOLIO)} portfolio items from DEFAULT_PORTFOLIO")


async def seed_testimonials():
    # Migration (idempotent): remove stale pre-rebrand testimonial rows that
    # were seeded from DEFAULT_TESTIMONIALS during the Fashion Interior era.
    # Real customer reviews synced from Google via SerpAPI always carry a
    # `google_fingerprint`; seeded rows never do. So any row WITHOUT a
    # fingerprint is treated as stale seed data and removed. A manual
    # testimonial added by the admin via the dashboard gets source='manual'
    # and is preserved (see condition below).
    migration_filter = {
        "google_fingerprint": {"$in": [None, ""]},
        "source": {"$ne": "manual"},
    }
    # Also match rows missing the fingerprint field entirely
    result = await db.testimonials.delete_many({
        "$and": [
            {"source": {"$ne": "manual"}},
            {"$or": [
                {"google_fingerprint": {"$exists": False}},
                {"google_fingerprint": None},
                {"google_fingerprint": ""},
            ]},
        ]
    })
    if result.deleted_count:
        logger.info(
            f"Migration: removed {result.deleted_count} stale pre-rebrand "
            "testimonials (no google_fingerprint, not manually added)."
        )

    # DEFAULT_TESTIMONIALS is intentionally empty after the rebrand — the
    # public testimonials section pulls real reviews via the 12-hourly Google
    # sync job. First boot of a brand-new DB will simply have an empty
    # testimonials list until the sync runs.
    if DEFAULT_TESTIMONIALS and await db.testimonials.count_documents({}) == 0:
        for idx, t in enumerate(DEFAULT_TESTIMONIALS):
            await db.testimonials.insert_one({
                **t,
                "id": str(uuid.uuid4()),
                "order": idx,
            })
        logger.info(f"Seeded {len(DEFAULT_TESTIMONIALS)} testimonials")


async def seed_business_info():
    if await db.business_info.find_one({"id": "main"}) is None:
        info = BusinessInfoIn().model_dump()
        info["id"] = "main"
        await db.business_info.insert_one(info)
        logger.info("Seeded business info")


scheduler = AsyncIOScheduler()


@app.on_event("startup")
async def on_startup():
    global client, db, gridfs, scheduler
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    gridfs = AsyncIOMotorGridFSBucket(db, bucket_name="uploads")
    scheduler = AsyncIOScheduler()
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.portfolio.create_index("order")
    await db.testimonials.create_index("order")
    await db.testimonials.create_index("google_fingerprint", sparse=True)
    await db.inquiries.create_index("created_at")
    await seed_admin()
    await seed_portfolio()
    await seed_testimonials()
    await seed_business_info()

    # Google Reviews auto-sync every 12 hours when configured (SerpAPI free tier = 100/mo).
    has_serp = bool(SERPAPI_KEY and GOOGLE_PLACE_ID)
    has_google = bool(GOOGLE_MAPS_API_KEY and GOOGLE_PLACE_ID)
    if (has_serp or has_google) and not scheduler.running:
        scheduler.add_job(
            sync_google_reviews,
            IntervalTrigger(hours=12),
            id="google_reviews_sync",
            name="Sync Google reviews every 12h",
            replace_existing=True,
            next_run_time=datetime.now(timezone.utc) + timedelta(seconds=10),
        )
        scheduler.start()
        logger.info(f"Google reviews scheduler started — runs every 12h via {'SerpAPI' if has_serp else 'Google Places'}")


@app.on_event("shutdown")
async def on_shutdown():
    if scheduler.running:
        scheduler.shutdown(wait=False)
    client.close()


# ---------- Mount ----------
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
