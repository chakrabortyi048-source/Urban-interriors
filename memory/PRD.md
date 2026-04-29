# Fashion Interior — PRD

## Original Problem Statement (verbatim summary)
Build a premium luxury website + admin dashboard for "Fashion Interior" — a Kolkata-based interior design studio (since 1985). Cinematic / editorial / luxury feel with deep charcoal + warm off-white + muted gold. Playfair Display + Inter typography. 8 sections on the public site (Hero, About, Portfolio, Services, Why Us, Testimonials, Contact, Footer) + a fully functional `/admin` dashboard with portfolio CMS, inquiries inbox, testimonials manager, settings (with branded password reset email via Resend). Use ONLY client-uploaded photos (5 provided). Hide Emergent watermark via CSS.

## Personas
- **Studio owner / admin (Aniket / Manoj)** — manages portfolio, replies to inquiries, edits business info, resets password.
- **Kolkata homeowner / business owner** — browsing for wallpaper, flooring, blinds; converts via the contact form or WhatsApp.

## Core Requirements (static)
- 8 public-site sections with cinematic motion (page loader, custom cursor, scroll progress, parallax hero, masonry portfolio, glass testimonial marquee, animated count-ups).
- 25 real Google reviews seeded; 13 services seeded; 5 client photos powering hero, about, portfolio.
- Business contact: 09007855295 · Rajarhat Main Rd, Atghara, New Town, Kolkata 700136 · Every day 9:15 AM – 8:30 PM.
- Floating WhatsApp FAB; embedded Google Maps; floating-label contact form.
- `/admin` JWT-auth dashboard: Overview, Portfolio (CRUD + reorder), Inquiries (sortable table + read/delete), Testimonials (CRUD), Settings (change email, change password, edit business info, trigger reset email).
- Branded HTML reset email (deep charcoal + gold) via Resend with graceful fallback (logs link if `RESEND_API_KEY` is empty).
- `/admin/reset-password?token=...` page for the secure reset flow.
- Emergent watermark hidden via CSS in `index.css`.

## What's Implemented (Dec 2025)
- Backend (`/app/backend/server.py`): JWT login/logout/me, forgot/reset password (Resend + fallback), change-email / change-password, admin-protected CRUD for portfolio + testimonials + inquiries + business info, public listing endpoints, auto-seed of admin user + 5 portfolio + 25 testimonials + business info on startup.
- Frontend: full marketing site + admin dashboard with all 5 sub-pages, page loader, custom cursor, scroll progress, mobile hamburger, sticky frosted navbar, masonry portfolio + lightbox, infinite testimonial marquee, floating-label contact form with success state, WhatsApp FAB, branded footer.
- Tests: `/app/backend/tests/backend_test.py` (19/20 pass; reset-password bug fixed Dec 2025).

## Backlog / Next
- **P0**: Configure `RESEND_API_KEY` so reset emails actually deliver. (User can paste key into `/app/backend/.env` and `sudo supervisorctl restart backend`.)
- **P1**: Add image upload (file → object storage → URL) inside Portfolio Manager so the admin doesn't have to paste image URLs.
- **P1**: Brute-force lockout on `/api/admin/login` (collection scaffolded but not yet enforced).
- **P2**: SEO meta tags (Open Graph, JSON-LD `LocalBusiness` with Rajarhat address + phone).
- **P2**: Sitemap.xml + robots.txt.
- **P2**: Inquiries → email notification to admin when a new lead lands.
- **P2**: Reply-via-email shortcut from the inquiry modal.
- **P2**: Pagination + search on inquiries when volume grows.

## Test Credentials
See `/app/memory/test_credentials.md`.
