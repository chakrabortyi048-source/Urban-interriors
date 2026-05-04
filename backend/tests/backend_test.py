"""Fashion Interior backend API tests.

Admin credentials are read from environment variables to avoid storing
secrets in source. Required env vars to run admin tests:
  - TEST_ADMIN_PASSWORD  (required for admin/auth tests)
  - TEST_ADMIN_EMAIL     (optional; default chakrabortyi048@gmail.com)
Public-only tests still run without these vars.
"""
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://aniket-interiors.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "chakrabortyi048@gmail.com")
OLD_ADMIN_EMAIL = "admin@fashioninterior.com"
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "")
NOTIFY_EMAIL = os.environ.get("TEST_NOTIFY_EMAIL", ADMIN_EMAIL)
BACKEND_LOG = "/var/log/supervisor/backend.err.log"

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "fashion_interior"

# Skip-decorator for tests that require admin credentials.
_admin_skip = pytest.mark.skipif(
    not ADMIN_PASSWORD,
    reason="TEST_ADMIN_PASSWORD env var not set; admin tests skipped",
)


@pytest.fixture(scope="session")
def mongo_db():
    c = MongoClient(MONGO_URL)
    yield c[DB_NAME]
    c.close()


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api):
    if not ADMIN_PASSWORD:
        pytest.skip("TEST_ADMIN_PASSWORD env var not set")
    r = api.post(f"{BASE_URL}/api/admin/login",
                 json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# --------- Public endpoints ---------
class TestPublic:
    def test_health(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_portfolio(self, api):
        r = api.get(f"{BASE_URL}/api/portfolio")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 5
        item = data[0]
        for f in ("id", "title", "category", "image_url"):
            assert f in item

    def test_testimonials(self, api):
        r = api.get(f"{BASE_URL}/api/testimonials")
        assert r.status_code == 200
        data = r.json()
        # Urban Interiors: 3 real Google reviews seeded; sync adds more over time
        assert len(data) >= 3
        # ratings are 1..5 ints
        for t in data:
            assert isinstance(t.get("rating"), int) and 1 <= t["rating"] <= 5

    def test_business_info(self, api):
        r = api.get(f"{BASE_URL}/api/business-info")
        assert r.status_code == 200
        d = r.json()
        # Urban Interiors phone (post-rebrand)
        assert d["phone"] == "8981230518"
        assert "Chinar" in d["address"] or "Newtown" in d["address"]
        assert d["hours"]

    def test_create_inquiry(self, api, mongo_db):
        payload = {
            "name": "TEST_User",
            "phone": "9999999999",
            "email": "TEST_inquiry@example.com",
            "service": "Wallpaper",
            "message": "TEST message please ignore",
            "callback_time": "Morning",
        }
        r = api.post(f"{BASE_URL}/api/inquiries", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["id"]
        assert d["is_read"] is False
        # persistence
        doc = mongo_db.inquiries.find_one({"id": d["id"]})
        assert doc is not None
        # cleanup
        mongo_db.inquiries.delete_one({"id": d["id"]})


# --------- Admin auth ---------
@_admin_skip
class TestAdminAuth:
    def test_login_ok(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["access_token"]
        assert d["role"] == "admin"

    def test_login_bad_password(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": "wrong-pass"})
        assert r.status_code == 401

    def test_me_ok(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_no_token(self, api):
        r = requests.get(f"{BASE_URL}/api/admin/me")
        assert r.status_code == 401

    def test_stats(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ("portfolio_count", "testimonials_count", "inquiries_count"):
            assert k in d


# --------- Forgot/Reset password flow ---------
@_admin_skip
class TestPasswordReset:
    def test_forgot_returns_ok(self, api):
        r = api.post(f"{BASE_URL}/api/admin/forgot-password",
                     json={"email": ADMIN_EMAIL})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_forgot_unknown_email_still_ok(self, api):
        r = api.post(f"{BASE_URL}/api/admin/forgot-password",
                     json={"email": "noexist@example.com"})
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_reset_password_flow(self, api, mongo_db):
        # trigger reset
        r = api.post(f"{BASE_URL}/api/admin/forgot-password",
                     json={"email": ADMIN_EMAIL})
        assert r.status_code == 200
        # fetch token from mongo
        rec = mongo_db.password_reset_tokens.find_one(
            {"email": ADMIN_EMAIL, "used": False}, sort=[("created_at", -1)])
        assert rec is not None
        token = rec["token"]
        new_pw = "TempPass@2025X"
        r2 = api.post(f"{BASE_URL}/api/admin/reset-password",
                      json={"token": token, "new_password": new_pw})
        assert r2.status_code == 200
        # login with new password
        r3 = api.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": new_pw})
        assert r3.status_code == 200
        # restore via change-password using new token
        tok = r3.json()["access_token"]
        h = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}
        r4 = requests.post(f"{BASE_URL}/api/admin/change-password",
                           json={"current_password": new_pw,
                                 "new_password": ADMIN_PASSWORD},
                           headers=h)
        assert r4.status_code == 200

    def test_reset_invalid_token(self, api):
        r = api.post(f"{BASE_URL}/api/admin/reset-password",
                     json={"token": "invalid-xyz", "new_password": "Abc12345!"})
        assert r.status_code == 400


# --------- Change password / email ---------
@_admin_skip
class TestChangeCredentials:
    def test_change_password_wrong_current(self, api, auth_headers):
        r = api.post(f"{BASE_URL}/api/admin/change-password",
                     json={"current_password": "wrong", "new_password": "NewPass@2025"},
                     headers=auth_headers)
        assert r.status_code == 400

    def test_change_email_and_revert(self, api, auth_headers):
        new_email = "TEST_admin_temp@example.com"
        r = api.post(f"{BASE_URL}/api/admin/change-email",
                     json={"current_password": ADMIN_PASSWORD, "new_email": new_email},
                     headers=auth_headers)
        assert r.status_code == 200
        # login with new email
        r2 = api.post(f"{BASE_URL}/api/admin/login",
                      json={"email": new_email, "password": ADMIN_PASSWORD})
        assert r2.status_code == 200
        tok = r2.json()["access_token"]
        h = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}
        # revert
        r3 = requests.post(f"{BASE_URL}/api/admin/change-email",
                           json={"current_password": ADMIN_PASSWORD, "new_email": ADMIN_EMAIL},
                           headers=h)
        assert r3.status_code == 200


# --------- Password change persistence regression ---------
@_admin_skip
class TestPasswordChangePersistence:
    """Regression test for the bug where admin password changes were silently
    reverted by seed_admin() on every backend restart. After a change-password,
    the admin user MUST have `password_changed: True` persisted so no future
    restart will clobber the new hash."""

    def test_change_marks_password_changed_flag(self, api, admin_token):
        h = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        # Rotate to a new password, verify it works, then rotate back.
        temp_pw = f"TempRegressionPW_{uuid.uuid4().hex[:8]}@2026"
        r = api.post(f"{BASE_URL}/api/admin/change-password",
                     json={"current_password": ADMIN_PASSWORD, "new_password": temp_pw},
                     headers=h)
        assert r.status_code == 200, r.text

        # New password logs in
        r2 = api.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": temp_pw})
        assert r2.status_code == 200

        # Old .env password must NOT log in
        r3 = api.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r3.status_code == 401

        # password_changed flag is stamped in DB
        client = MongoClient(MONGO_URL)
        u = client[DB_NAME].users.find_one({"email": ADMIN_EMAIL}, {"_id": 0})
        assert u is not None
        assert u.get("password_changed") is True
        assert u.get("password_changed_at")

        # Revert — use the temp token returned by login
        tok = r2.json()["access_token"]
        h2 = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}
        r4 = api.post(f"{BASE_URL}/api/admin/change-password",
                      json={"current_password": temp_pw, "new_password": ADMIN_PASSWORD},
                      headers=h2)
        assert r4.status_code == 200

        # Original password logs in again
        r5 = api.post(f"{BASE_URL}/api/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r5.status_code == 200


# --------- Portfolio CRUD ---------
class TestPortfolioCRUD:
    def test_full_crud(self, api, auth_headers):
        # create
        payload = {"title": "TEST_proj", "category": "TEST", "description": "d",
                   "image_url": "https://example.com/x.jpg", "aspect": "square"}
        r = api.post(f"{BASE_URL}/api/admin/portfolio", json=payload, headers=auth_headers)
        assert r.status_code == 200
        item = r.json()
        item_id = item["id"]
        # update
        payload["title"] = "TEST_proj_updated"
        r2 = api.put(f"{BASE_URL}/api/admin/portfolio/{item_id}", json=payload, headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json()["title"] == "TEST_proj_updated"
        # list contains
        r3 = api.get(f"{BASE_URL}/api/admin/portfolio", headers=auth_headers)
        assert any(p["id"] == item_id for p in r3.json())
        # reorder (just include this id at front)
        ids = [p["id"] for p in r3.json()]
        ids.remove(item_id); ids.insert(0, item_id)
        r4 = api.post(f"{BASE_URL}/api/admin/portfolio/reorder",
                      json={"ids": ids}, headers=auth_headers)
        assert r4.status_code == 200
        # delete
        r5 = api.delete(f"{BASE_URL}/api/admin/portfolio/{item_id}", headers=auth_headers)
        assert r5.status_code == 200
        # 404 after delete
        r6 = api.delete(f"{BASE_URL}/api/admin/portfolio/{item_id}", headers=auth_headers)
        assert r6.status_code == 404


# --------- Testimonials CRUD ---------
class TestTestimonialsCRUD:
    def test_full_crud(self, api, auth_headers):
        payload = {"name": "TEST_Reviewer", "rating": 5, "text": "TEST review",
                   "when": "today", "is_local_guide": False, "review_count": 1}
        r = api.post(f"{BASE_URL}/api/admin/testimonials", json=payload, headers=auth_headers)
        assert r.status_code == 200
        item_id = r.json()["id"]
        payload["text"] = "TEST review updated"
        r2 = api.put(f"{BASE_URL}/api/admin/testimonials/{item_id}", json=payload, headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json()["text"] == "TEST review updated"
        r3 = api.delete(f"{BASE_URL}/api/admin/testimonials/{item_id}", headers=auth_headers)
        assert r3.status_code == 200


# --------- Inquiries admin ops ---------
class TestInquiriesAdmin:
    def test_list_mark_delete(self, api, auth_headers, mongo_db):
        # seed a TEST inquiry via public endpoint
        p = {"name": "TEST_X", "phone": "1", "email": "TEST_x@example.com",
             "service": "", "message": "TEST", "callback_time": ""}
        rc = api.post(f"{BASE_URL}/api/inquiries", json=p)
        assert rc.status_code == 200
        iid = rc.json()["id"]
        # list contains
        r = api.get(f"{BASE_URL}/api/admin/inquiries", headers=auth_headers)
        assert r.status_code == 200
        assert any(x["id"] == iid for x in r.json())
        # mark read
        r2 = api.post(f"{BASE_URL}/api/admin/inquiries/{iid}/read", headers=auth_headers)
        assert r2.status_code == 200
        # verify persistence
        doc = mongo_db.inquiries.find_one({"id": iid})
        assert doc.get("is_read") is True
        # delete
        r3 = api.delete(f"{BASE_URL}/api/admin/inquiries/{iid}", headers=auth_headers)
        assert r3.status_code == 200


# --------- Business info ---------
class TestBusinessInfo:
    def test_get_and_put(self, api, auth_headers):
        r = api.get(f"{BASE_URL}/api/admin/business-info", headers=auth_headers)
        assert r.status_code == 200
        original = r.json()
        update = {**original, "instagram": "https://instagram.com/test_handle"}
        # remove fields not in model
        for k in list(update.keys()):
            if k not in {"business_name", "address", "phone", "whatsapp", "email",
                         "hours", "instagram", "facebook", "google_maps_url"}:
                update.pop(k)
        r2 = api.put(f"{BASE_URL}/api/admin/business-info", json=update, headers=auth_headers)
        assert r2.status_code == 200
        # verify
        r3 = api.get(f"{BASE_URL}/api/business-info")
        assert r3.json()["instagram"] == "https://instagram.com/test_handle"
        # revert
        revert = {k: v for k, v in original.items()
                  if k in {"business_name", "address", "phone", "whatsapp", "email",
                           "hours", "instagram", "facebook", "google_maps_url"}}
        api.put(f"{BASE_URL}/api/admin/business-info", json=revert, headers=auth_headers)



# --------- New email login (iteration 2) ---------
@_admin_skip
class TestAdminEmailChange:
    def test_old_email_fails(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": OLD_ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 401

    def test_new_email_works(self, api):
        r = api.post(f"{BASE_URL}/api/admin/login",
                     json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        assert r.json()["role"] == "admin"


# --------- Lead notification email on inquiry ---------
class TestLeadNotification:
    def test_inquiry_triggers_lead_email_log(self, api):
        # snapshot log size
        try:
            with open(BACKEND_LOG, "rb") as f:
                f.seek(0, 2)
                start_pos = f.tell()
        except FileNotFoundError:
            pytest.skip(f"backend log not present: {BACKEND_LOG}")

        unique = f"TEST_lead_{uuid.uuid4().hex[:8]}"
        payload = {
            "name": unique, "phone": "9999999999",
            "email": f"{unique}@example.com",
            "service": "Wallpaper", "message": "lead-notify TEST",
            "callback_time": "Morning",
        }
        r = api.post(f"{BASE_URL}/api/inquiries", json=payload)
        assert r.status_code == 200
        iid = r.json()["id"]

        # Wait up to ~6s for fire-and-forget log
        new_text = ""
        deadline = time.time() + 6
        while time.time() < deadline:
            with open(BACKEND_LOG, "rb") as f:
                f.seek(start_pos)
                new_text = f.read().decode(errors="ignore")
            if "Lead notification sent" in new_text:
                break
            time.sleep(0.4)

        assert "Lead notification sent" in new_text, (
            f"Expected 'Lead notification sent' in backend log after inquiry {iid}; "
            f"got tail: ...{new_text[-500:]}"
        )
        assert NOTIFY_EMAIL in new_text


# --------- Forgot-password sends via Resend ---------
class TestForgotPasswordResendLog:
    def test_forgot_password_email_sent_log(self, api):
        try:
            with open(BACKEND_LOG, "rb") as f:
                f.seek(0, 2)
                start_pos = f.tell()
        except FileNotFoundError:
            pytest.skip("backend log missing")
        r = api.post(f"{BASE_URL}/api/admin/forgot-password",
                     json={"email": ADMIN_EMAIL})
        assert r.status_code == 200
        new_text = ""
        deadline = time.time() + 6
        while time.time() < deadline:
            with open(BACKEND_LOG, "rb") as f:
                f.seek(start_pos)
                new_text = f.read().decode(errors="ignore")
            if "Password reset email sent" in new_text or "reset email sent" in new_text.lower():
                break
            time.sleep(0.4)
        assert ("Password reset email sent" in new_text
                or "reset email sent" in new_text.lower()), (
            f"Expected 'Password reset email sent' log; tail: ...{new_text[-500:]}")


# --------- Image Upload ---------
import io
PNG_1x1 = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8"
    b"\xcf\xc0\x00\x00\x00\x03\x00\x01\x5b\x82\x9d\xae\x00\x00\x00\x00"
    b"IEND\xaeB`\x82"
)


class TestUpload:
    def test_upload_no_auth(self):
        files = {"file": ("x.png", io.BytesIO(PNG_1x1), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert r.status_code == 401

    def test_upload_image_ok(self, auth_headers):
        # multipart needs no Content-Type header; strip JSON header
        h = {"Authorization": auth_headers["Authorization"]}
        files = {"file": ("test.png", io.BytesIO(PNG_1x1), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=h)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "url" in d and "filename" in d and "size" in d and "id" in d
        # GridFS: id is 24-char hex ObjectId
        assert len(d["id"]) == 24
        assert all(c in "0123456789abcdef" for c in d["id"]), f"id is not hex: {d['id']}"
        assert d["url"].endswith(f"/api/uploads/{d['id']}")
        assert d["filename"].endswith(".png")
        assert d["size"] == len(PNG_1x1)
        # Fetch via GridFS-backed serve endpoint (use public URL regardless of returned scheme)
        public_url = f"{BASE_URL}/api/uploads/{d['id']}"
        g = requests.get(public_url)
        assert g.status_code == 200
        ct = g.headers.get("content-type", "").lower()
        assert ct == "image/png", f"unexpected content-type: {ct}"
        # Cache-Control is set by backend but Cloudflare may override on public URL;
        # verify at localhost level.
        try:
            g2 = requests.get(f"http://localhost:8001/api/uploads/{d['id']}", timeout=8)
            assert "max-age" in g2.headers.get("cache-control", "").lower(), (
                f"Backend Cache-Control missing at localhost: {g2.headers.get('cache-control')}")
        except requests.RequestException:
            pass
        assert g.content == PNG_1x1

    def test_upload_url_uses_public_https_when_proxied(self, auth_headers):
        """When request comes through public https ingress, url must be https
        and use the public hostname — otherwise <img> on the admin page will be
        blocked by the browser as mixed content."""
        h = {"Authorization": auth_headers["Authorization"]}
        files = {"file": ("public.png", io.BytesIO(PNG_1x1), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=h)
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        # The returned URL should match the public scheme/host the user hit
        assert url.startswith(BASE_URL + "/api/uploads/"), (
            f"Returned URL {url!r} does not match public BASE_URL {BASE_URL!r}. "
            "request.base_url is reading the internal proxy host/scheme. "
            "Fix: start uvicorn with --proxy-headers --forwarded-allow-ips='*' "
            "OR build URL from X-Forwarded-Proto / X-Forwarded-Host headers.")

    def test_upload_url_adapts_to_request_base_url(self, auth_headers):
        """Hit localhost:8001 and verify returned URL uses localhost prefix."""
        h = {"Authorization": auth_headers["Authorization"]}
        files = {"file": ("local.png", io.BytesIO(PNG_1x1), "image/png")}
        try:
            r = requests.post("http://localhost:8001/api/admin/upload",
                              files=files, headers=h, timeout=10)
        except Exception as e:
            pytest.skip(f"localhost:8001 not reachable: {e}")
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        assert url.startswith("http://localhost:8001/api/uploads/"), (
            f"URL not adapted to localhost base_url: {url}")

    def test_serve_invalid_id_404(self):
        r = requests.get(f"{BASE_URL}/api/uploads/notavalidid")
        assert r.status_code == 404

    def test_serve_nonexistent_objectid_404(self):
        # 24-char hex but not in GridFS
        r = requests.get(f"{BASE_URL}/api/uploads/000000000000000000000000")
        assert r.status_code == 404

    def test_upload_bad_extension(self, auth_headers):
        h = {"Authorization": auth_headers["Authorization"]}
        files = {"file": ("bad.txt", io.BytesIO(b"hello"), "text/plain")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=h)
        assert r.status_code == 400
        assert "Unsupported" in r.text or "unsupported" in r.text.lower()

    def test_upload_empty(self, auth_headers):
        h = {"Authorization": auth_headers["Authorization"]}
        files = {"file": ("empty.png", io.BytesIO(b""), "image/png")}
        r = requests.post(f"{BASE_URL}/api/admin/upload", files=files, headers=h)
        assert r.status_code == 400


# --------- SEO / robots / sitemap ---------
class TestSEO:
    def test_index_html_has_seo(self):
        # frontend serves /index.html on the public URL
        r = requests.get(f"{BASE_URL}/", timeout=15)
        assert r.status_code == 200
        html = r.text
        assert "<title>Urban Interiors" in html
        assert 'name="description"' in html
        assert 'property="og:title"' in html
        assert 'property="og:image"' in html
        assert 'name="twitter:card"' in html
        assert 'application/ld+json' in html
        assert '"HomeAndConstructionBusiness"' in html
        assert '+91-8981230518' in html
        assert 'Chinar Park' in html or 'Newtown' in html
        # 24-hour business
        assert '00:00' in html and '23:59' in html
        assert '"ratingValue": "4.7"' in html or '"ratingValue":"4.7"' in html or '"ratingValue": 4.7' in html
        assert 'hasOfferCatalog' in html

    def test_index_html_has_runtime_url_patch_script(self):
        """Inline script patches canonical/og:url/JSON-LD @id/url to window.location.origin."""
        r = requests.get(f"{BASE_URL}/", timeout=15)
        assert r.status_code == 200
        html = r.text
        # Must reference window.location.origin to patch URLs at runtime
        assert "window.location.origin" in html, "Missing runtime URL patch script"
        # JSON-LD must be parseable
        import re
        import json as _json
        m = re.search(
            r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',
            html, re.DOTALL)
        assert m, "JSON-LD script tag not found"
        try:
            _json.loads(m.group(1).strip())
        except Exception as e:
            pytest.fail(f"JSON-LD not parseable: {e}")

    def test_robots_txt(self):
        r = requests.get(f"{BASE_URL}/robots.txt", timeout=15)
        assert r.status_code == 200
        assert "Disallow: /admin" in r.text

    def test_sitemap_xml(self):
        r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=15)
        assert r.status_code == 200
        # parse XML
        import xml.etree.ElementTree as ET
        try:
            ET.fromstring(r.text)
        except ET.ParseError as e:
            pytest.fail(f"sitemap.xml is not valid XML: {e}")
