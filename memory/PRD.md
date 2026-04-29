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

## Enhancement pack 1 (Dec 2025) — all 4 next-action items shipped
- **Resend live**: `RESEND_API_KEY` configured. Branded HTML reset emails are now actually delivered. Sender: `Fashion Interior <onboarding@resend.dev>` (Resend test sender, no domain verification needed).
- **Admin email switched** to `chakrabortyi048@gmail.com` (the inbox the user signed up to Resend with — Resend test mode only delivers there).
- **Image upload in Portfolio Manager**: new `/api/admin/upload` endpoint (12MB cap, PNG/JPG/WebP/GIF) → file saved to `/app/backend/uploads/` → served via `app.mount("/api/uploads", StaticFiles(...))`. Admin form now has an "Upload Image" button beside the URL field; once uploaded the URL is auto-filled.
- **SEO**: `<head>` rewritten with `<title>`, meta description/keywords, Open Graph, Twitter card, canonical, and a complete `LocalBusiness`/`HomeAndConstructionBusiness` JSON-LD (address, phone +91-9007855295, openingHours 09:15–20:30 daily, geo, aggregateRating 5.0/25, hasOfferCatalog with all 13 services). `/robots.txt` (disallows `/admin`) and `/sitemap.xml` published.
- **Lead notification email**: every contact-form submission now triggers a fire-and-forget Resend email to `NOTIFY_EMAIL` (= admin email). Branded HTML template with name / phone / email / service / message / Call-back + WhatsApp CTA buttons. 31/31 backend tests pass.

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
