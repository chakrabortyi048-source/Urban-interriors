"""Session-wide pytest fixtures.

Restores the admin user's email + password after the test session so no
individual test (or browser-based testing agent run) can leave the dashboard
in a broken state. Active only when TEST_ADMIN_PASSWORD is set, so CI runs
that skip admin tests are unaffected.
"""
import os
import sys
import pathlib

import pytest
from pymongo import MongoClient

# tests/backend_test.py imports use top-level constants — load them via path
THIS = pathlib.Path(__file__).parent
sys.path.insert(0, str(THIS))
from backend_test import MONGO_URL, DB_NAME  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def restore_admin_state_after_session():
    if not os.environ.get("TEST_ADMIN_PASSWORD"):
        yield
        return

    client = MongoClient(MONGO_URL)
    coll = client[DB_NAME]["users"]
    snapshot = coll.find_one({"role": "admin"}) or {}

    yield

    if snapshot.get("id") and snapshot.get("email") and snapshot.get("password_hash"):
        coll.update_one(
            {"id": snapshot["id"]},
            {"$set": {
                "email": snapshot["email"],
                "password_hash": snapshot["password_hash"],
                "password_changed": snapshot.get("password_changed", True),
                "email_changed": snapshot.get("email_changed", False),
            }},
        )
