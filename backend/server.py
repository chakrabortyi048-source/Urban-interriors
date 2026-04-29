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
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


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
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
JWT_ALG = "HS256"

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("fashion-interior")

# ---------- DB ----------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------- App ----------
app = FastAPI(title="Fashion Interior API")
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
              <div style="font-family:Georgia,'Playfair Display',serif;font-size:28px;color:#CBA153;letter-spacing:0.5px;">Fashion Interior</div>
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8a8a8a;margin-top:6px;">Kolkata · Since 1985</div>
            </td></tr>
            <tr><td style="padding:36px 40px;color:#F9F8F6;">
              <h1 style="font-family:Georgia,'Playfair Display',serif;font-size:30px;font-weight:400;margin:0 0 16px 0;color:#F9F8F6;letter-spacing:-0.5px;">Reset your password</h1>
              <p style="font-size:15px;line-height:1.7;color:#cfcfcf;margin:0 0 28px 0;">
                We received a request to reset the password for your Fashion Interior admin account.
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
                Fashion Interior · Rajarhat Main Rd, opposite Rupam Motors, Atghara, Rajarhat, New Town, Kolkata 700136<br/>
                © 2025 Fashion Interior. All Rights Reserved.
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
        "from": f"Fashion Interior <{SENDER_EMAIL}>",
        "to": [to_email],
        "subject": "Reset your Fashion Interior admin password",
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
                Fashion Interior · Rajarhat Main Rd, Atghara, New Town, Kolkata 700136<br/>
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
        "from": f"Fashion Interior Leads <{SENDER_EMAIL}>",
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
    business_name: str = "Fashion Interior"
    address: str = "Rajarhat Main Rd, opposite Rupam Motors, Atghara, Rajarhat, New Town, Kolkata, West Bengal 700136"
    phone: str = "09007855295"
    whatsapp: str = "09007855295"
    email: str = "info@fashioninterior.com"
    hours: str = "Every day, 9:15 AM – 8:30 PM"
    instagram: str = ""
    facebook: str = ""
    google_maps_url: str = "https://maps.google.com/?q=Fashion+Interior+Rajarhat+Kolkata"


# ---------- Public routes ----------
@api.get("/")
async def root():
    return {"message": "Fashion Interior API", "status": "ok"}


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
async def admin_forgot(payload: ForgotIn):
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
        reset_link = f"{FRONTEND_URL}/admin/reset-password?token={token}"
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
    await db.users.update_one({"id": rec["user_id"]}, {"$set": {"password_hash": new_hash}})
    await db.password_reset_tokens.update_one({"token": payload.token}, {"$set": {"used": True}})
    return {"ok": True, "message": "Password updated successfully"}


@api.post("/admin/change-password")
async def admin_change_password(payload: ChangePasswordIn, user: dict = Depends(get_current_admin)):
    full = await db.users.find_one({"id": user["id"]})
    if not full or not verify_password(payload.current_password, full["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(payload.new_password)}})
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
    await db.users.update_one({"id": user["id"]}, {"$set": {"email": new_email}})
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
    for idx, item_id in enumerate(payload.ids):
        await db.portfolio.update_one({"id": item_id}, {"$set": {"order": idx}})
    return {"ok": True}


# ---------- Admin: Upload ----------
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD_BYTES = 12 * 1024 * 1024  # 12 MB

@api.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), user: dict = Depends(get_current_admin)):
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
    fname = f"{uuid.uuid4().hex}{ext}"
    fpath = UPLOAD_DIR / fname
    with open(fpath, "wb") as f:
        f.write(data)
    base = FRONTEND_URL.rstrip('/')
    url = f"{base}/api/uploads/{fname}"
    return {"url": url, "filename": fname, "size": len(data)}


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
DEFAULT_PORTFOLIO = [
    {"title": "Golden Floral Dining Suite", "category": "Wallpaper · Residential",
     "description": "A moody, opulent dining room finished in our German-make gold floral wallpaper. Warm cove lighting and a curated mirror line make this small space read enormous.",
     "image_url": "https://customer-assets.emergentagent.com/job_4e352398-ef7d-4f99-8305-24b84c12ade6/artifacts/zh7h9lsp_Screenshot_2026-04-28_164511.jpg",
     "aspect": "square"},
    {"title": "Rajarhat Living Lounge", "category": "Wooden Flooring · Residential",
     "description": "A 4BHK living lounge with herringbone wooden flooring, layered cove ceiling lighting and a custom TV unit panel. Calm, modern, family-first.",
     "image_url": "https://customer-assets.emergentagent.com/job_4e352398-ef7d-4f99-8305-24b84c12ade6/artifacts/o8oeed6y_Screenshot_2026-04-28_164526.jpg",
     "aspect": "square"},
    {"title": "Heritage Floral Drawing Room", "category": "Customised Wallpaper · Residential",
     "description": "Custom-printed striped damask wallpaper for a heritage-style drawing room. Soft daylight, ivory upholstery and a fireplace mantel.",
     "image_url": "https://customer-assets.emergentagent.com/job_4e352398-ef7d-4f99-8305-24b84c12ade6/artifacts/y6rspc66_Screenshot_2026-04-28_164551.jpg",
     "aspect": "square"},
    {"title": "Stone Accent Sunroom", "category": "3D Panels · Residential",
     "description": "Hand-laid PVC stone-clad accent wall in a glass sunroom. Texture, light and greenery treated as a single composition.",
     "image_url": "https://customer-assets.emergentagent.com/job_4e352398-ef7d-4f99-8305-24b84c12ade6/artifacts/epcwhole_Screenshot_2026-04-28_164540.jpg",
     "aspect": "square"},
    {"title": "Striped Canopy Showroom", "category": "PVC Laminates · Commercial",
     "description": "An in-progress showroom finish with a custom-curved striped canopy ceiling and book-matched marble columns. Statement architecture for retail.",
     "image_url": "https://customer-assets.emergentagent.com/job_4e352398-ef7d-4f99-8305-24b84c12ade6/artifacts/rtmbdojk_Screenshot_2026-04-28_164557.jpg",
     "aspect": "square"},
]


DEFAULT_TESTIMONIALS = [
    {"name": "Dhritishikha Baishya", "rating": 5, "when": "a month ago", "is_local_guide": True, "review_count": 15,
     "text": "We had a great and smooth experience in purchasing wallpapers and decor for our new house from the store. Aniket truly helped us in making the right choice and made our home walls so beautiful. The installation was done on time too! Keep up the work. Much recommended store!"},
    {"name": "ankita Sethia", "rating": 5, "when": "6 months ago", "review_count": 5,
     "text": "They have a wide variety of wallpapers and flooring. Recently got my space a makeover from them. Highly recommend !"},
    {"name": "Abhijit Roy", "rating": 5, "when": "9 months ago", "is_local_guide": True, "review_count": 72,
     "text": "I have done vinyl flooring with tiles from this shop. Owner Manoj ji is a very helpful person and explains details with care. I called the number given in his card and he arranged everything with labour and home delivery. I recommend this shop and will buy interior decoration items from him in future."},
    {"name": "Abstract Interior", "rating": 5, "when": "8 months ago", "review_count": 1,
     "text": "Excellent work support from fashion interior. Fully satisfied with their service. I always purchased wallpaper, blinds, louvers, customer wallpaper. They are very conscious with their work. Price is very reasonable. I always prefer to do work with them ❤️❤️"},
    {"name": "Arunabha Bhattacharya", "rating": 5, "when": "a year ago", "is_local_guide": True, "review_count": 37,
     "text": "I would like to thank fashion interior and Mr. Aniket for the wonderful service. I had ordered flutted panel from his showroom and he ensured to deliver it safely to my doorstep. He was got a wonderful collection of wallpapers, wall panels, laminates etc. Quality is good at a reasonable price."},
    {"name": "Abhishek Toshniwal", "rating": 5, "when": "6 months ago", "review_count": 6,
     "text": "I was thoroughly impressed by the warm and welcoming atmosphere. The owner's expertise and passion for design were evident in every aspect of the shop, from the beautifully curated collection to the stunning displays. What truly stood out, however, was the owner's exceptional customer service skills - they were attentive, knowledgeable, and genuinely interested in helping me find the perfect pieces for my home. Their soft and courteous demeanor made me feel at ease, and I appreciated their willingness to take the time to understand my needs and preferences. Overall, it was a delightful experience, and I highly recommend this shop to anyone looking for exceptional interior design solutions and outstanding customer service."},
    {"name": "Aaheli Sikdar", "rating": 5, "when": "11 months ago", "review_count": 9,
     "text": "This is my Third purchase from Fashion Interior. They have superb quality products and the behaviour of the owner and all other people are extremely polite. If you are looking for a genuine place for wallpapers and other interior stuffs then you must visit this place."},
    {"name": "Birendra Barma", "rating": 5, "when": "4 months ago", "review_count": 1,
     "text": "One of the most affordable collection of wallpapers, louvers, pvc flooring and blinds. Huge collection with ample of samples in Korean, german and Russian make in wallpapers. Must visit store near Chinar park for home and office makeovers"},
    {"name": "Sujit Bhowmick", "rating": 5, "when": "2 months ago", "review_count": 1,
     "text": "Best shop for blinds and pvc flooring, I do regular work of blinds and curtains, their service is commendable and very reasonable rates. Must recommend"},
    {"name": "Madhavi Naidu Mazumdar", "rating": 5, "when": "a year ago", "is_local_guide": True, "review_count": 22,
     "text": "Very Happy with the Services with uncompromised Quality Products. Special thanks to Ankit Ji and Manoj Ji for all their advice and cooperation. Will surely recommend Fashion Decor to all looking for quality and hassle free service with gardening beautification."},
    {"name": "Shrilekha Mukherjee", "rating": 5, "when": "8 months ago", "review_count": 10,
     "text": "They have helped me with the most efficient installation and great designs. Will surely come back for future projects"},
    {"name": "zishan akhtar", "rating": 5, "when": "3 months ago", "is_local_guide": True, "review_count": 36,
     "text": "Very professional and helpful conduct with good service and reasonable price."},
    {"name": "Manas Das", "rating": 5, "when": "a year ago", "is_local_guide": True, "review_count": 246,
     "text": "Great collection. Good behavior with a best price. Recommend to visit while you are renovate your house or an office."},
    {"name": "Shreya Goenka", "rating": 5, "when": "8 months ago", "review_count": 6,
     "text": "This is my 7th or 8th purchase with Fashion interiors (I have lost count :p) and Aniket ji has always been nothing but extremely helpful. From helping in the right selection of the wallpapers and flooring to ensuring no hassle in delivery and pasting, he ensures the process is smooth and the experience is delightful."},
    {"name": "Loknath Agarwala", "rating": 5, "when": "11 months ago", "review_count": 1,
     "text": "One of the best shops in the area, they have huge variety of wallpapers in all range including many interior related products, Mr Bhawsinghka is a true gentleman who personally assists with years of experience and knowledge, I will 100% recommend them as they are running this business since last 40 years."},
    {"name": "Santosh Mohapatra", "rating": 5, "when": "5 months ago", "is_local_guide": True, "review_count": 64,
     "text": "Very professional. Helps & guide like a family member. Work quality is very good."},
    {"name": "Md Mahatab", "rating": 5, "when": "11 months ago", "review_count": 1,
     "text": "Reasonable price and awesome wallpaper collection"},
    {"name": "Abhishek Shaw", "rating": 5, "when": "a year ago", "review_count": 1,
     "text": "Best shop in Chinar park rajarhat area, good variety collection of wallpapers, pvc flooring, customised wallpaper, blinds, louvers and many more. Prices are very reasonable compared to other shops nearby, great and calming behaviour of owner and staff. I took wallpaper for my home which was quickly installed hassle free. Thanks to manoj ji for help and great service."},
    {"name": "M. Kumar", "rating": 5, "when": "11 months ago", "review_count": 2,
     "text": "Nice work, He was got a wonderful collection of wallpapers, wall panels, laminates etc. Quality is good at a reasonable price. Mr. Aniket have wonderful service regarding above all of this.. Thanks"},
    {"name": "Sneha Toshniwal", "rating": 5, "when": "6 months ago", "review_count": 5,
     "text": "Amazing collection as per your preference ..in a very reasonable rate. do visit."},
    {"name": "Ravi Kumar", "rating": 5, "when": "a year ago", "review_count": 9,
     "text": "This interior design shop is conveniently located on the main road itself and it offers a great selection of stylish and high-quality décor..."},
    {"name": "Aman Kumar Jaiswal", "rating": 5, "when": "2 months ago", "review_count": 2,
     "text": "The quality of the product amazing, great service too."},
    {"name": "Umesh Soni", "rating": 5, "when": "a year ago", "review_count": 4,
     "text": "Very good collection and above that most decent behaviour."},
    {"name": "Hansa Rungta", "rating": 5, "when": "2 years ago", "is_local_guide": True, "review_count": 6,
     "text": "Very accommodating in all their deals. You may get the same product and rates elsewhere but with all guarantee, the service provided to us has been prompt, clear, free of false commitments. The owner is always there to own up his responsibility without any friction if anything goes wrong with the order or at site. Which is a very rare business trait among product suppliers in interior designing. Would suggest to go for Fashion Interior, if you need a clean and stress free purchase, installation and billing! For them service comes first."},
    {"name": "soumya roy", "rating": 5, "when": "2 years ago", "review_count": 12,
     "text": "Got my wallpaper and artificial turf from here and it's been a truly satisfying experience. Varied and exquisite collection at extremely reasonable price along with excellent customer service. Would highly recommend."},
]


async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin user {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
        # Only refresh hash if user hasn't already changed their password (heuristic: keep idempotent)
        # We do NOT overwrite if a user has manually changed it via dashboard.
        # Detect first-run by absence of `password_changed` flag.
        if not existing.get("password_changed"):
            await db.users.update_one(
                {"email": ADMIN_EMAIL.lower()},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info("Refreshed admin password from .env")


async def seed_portfolio():
    if await db.portfolio.count_documents({}) == 0:
        for idx, p in enumerate(DEFAULT_PORTFOLIO):
            await db.portfolio.insert_one({
                **p,
                "id": str(uuid.uuid4()),
                "order": idx,
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        logger.info("Seeded default portfolio")


async def seed_testimonials():
    if await db.testimonials.count_documents({}) == 0:
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


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.portfolio.create_index("order")
    await db.testimonials.create_index("order")
    await db.inquiries.create_index("created_at")
    await seed_admin()
    await seed_portfolio()
    await seed_testimonials()
    await seed_business_info()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------- Mount ----------
app.include_router(api)

# Serve uploaded portfolio images at /api/uploads/<filename>
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
