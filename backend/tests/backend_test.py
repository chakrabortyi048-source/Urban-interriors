"""Fashion Interior backend API tests."""
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://aniket-interiors.preview.emergentagent.com').rstrip('/')
ADMIN_EMAIL = "admin@fashioninterior.com"
ADMIN_PASSWORD = "FashionAdmin@2025"

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "fashion_interior"


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
        assert len(data) >= 25
        assert all(t.get("rating") == 5 for t in data)

    def test_business_info(self, api):
        r = api.get(f"{BASE_URL}/api/business-info")
        assert r.status_code == 200
        d = r.json()
        assert d["phone"] == "09007855295"
        assert "Rajarhat" in d["address"]
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
