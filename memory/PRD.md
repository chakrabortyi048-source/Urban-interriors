# Urban Interiors — PRD (rebranded from Fashion Interior · Dec 2025)

## Business (live info)
- **Name**: Urban Interiors
- **Address**: Chinar Park, Atghara, Tegharia, Newtown, Kolkata, West Bengal 700136
- **Phone / WhatsApp**: 8981230518
- **Email**: urban.interiors.kol@gmail.com
- **Instagram**: https://www.instagram.com/urban.interiors.kol
- **Hours**: Everyday · 24 hours open

## Services (3)
- Interior Designer → **Interior Painting**
- Kitchen Renovator → **Drywall Repair**
- Furniture Maker → **Wood Staining**

## Testimonials (3, real Google reviews)
- Mitali Bhattacharya · 5★ · 4 months ago
- Sagar Dey · 5★ · 9 months ago
- Pritha Biswas · 3★ · 6 months ago
- Aggregate rating: 4.7/5

## Portfolio (5 items, real client photos)
Seeded with neutral titles — owner will rename via admin dashboard.

## Admin (unchanged)
- Email: chakrabortyi048@gmail.com
- Password: FashionAdmin@2025
- Resend key live — password-reset + lead-notification emails deliver.

## What was done in this rebrand
1. Replaced "Fashion Interior" → "Urban Interiors" across Navbar, Hero, Footer, PageLoader, AdminLogin, AdminDashboard, email templates, API title, index.html SEO/JSON-LD.
2. Hero copy + image swapped (new photo: wooden-slat TV wall) + "Kolkata · Chinar Park" overline.
3. About section fully redesigned with the new owner copy + 4 service pillars (Painting, Furniture, Flooring, Landscape) replacing the count-up numbers that relied on Fashion Interior's 40-year history.
4. Services reduced from 13 → 3 with new 3-column layout matching screenshot.
5. WhyChooseUs updated: removed "Since 1985" and "Manoj ji / Aniket ji" references.
6. Contact: new defaults (address, phone, hours), new service dropdown options, new Google Maps embed pointing to Chinar Park.
7. Footer: new brand, new tagline, new address/phone/hours.
8. Testimonials: heading changed to "Real reviews, from real Chinar Park clients" + honest 4.7/5 rating (not 5.0/5).
9. MongoDB: cleared old portfolio / testimonials / inquiries / business_info / GridFS files; re-seeded with 5 new portfolio items, 3 new testimonials, new business_info.
10. SEO index.html: title, description, OG tags, Twitter card, JSON-LD — all rewritten for Urban Interiors (address, phone, 24-hour schedule, aggregateRating 4.7, 7-service offer catalog, Instagram in sameAs). Runtime URL-patcher updated to new `@id`.

## Admin → Live Site: how it's wired
- Portfolio: admin CRUD → public `/api/portfolio` → homepage portfolio section
- Testimonials: admin CRUD → public `/api/testimonials` → homepage carousel
- Business Info (address / phone / hours / socials): admin Settings → public `/api/business-info` → Footer + Contact + WhatsApp button
- Image uploads stored in MongoDB GridFS (survive every redeploy)


## Feb 2026 — Hero & About Cinematic Refresh
- **Hero** (`/app/frontend/src/components/site/Hero.jsx`): new bright living-room render (WA0025.jpg) as background; added Ken Burns slow-zoom (18s) + animated gold accent line above headline; softer radial + bottom-only gradient to keep the image bright.
- **About** (`/app/frontend/src/components/site/About.jsx`): replaced single image with professional 2-image collage — primary modular-kitchen shot (WA0024.jpg) offset with gold accent frame, secondary golden-floral dining room floating bottom-right with soft-float animation; studio-note card overlays the collage; mobile fallback stacks the secondary image.
- CSS keyframes `fi-kenburns`, `fi-gold-sweep`, `fi-float-soft` added to `/app/frontend/src/index.css`.
- Verified via screenshot tool (1920×800) — both sections render correctly, images load from customer-assets CDN.


## Feb 2026 — Site-wide Cinematic Text Animations + About Text-on-Image
- **New `SplitHeading` component** (`/app/frontend/src/components/site/SplitHeading.jsx`):
  - Word-mask reveal: each word slides up from a clip-mask + un-skews on intersection (1.05s per word, ~70ms stagger).
  - Includes `SpreadOverline` (letter-spacing animates 0 → 0.4em on scroll) and `CharReveal` (char-by-char fade for paragraphs).
- **Applied site-wide** to every major H2: About, Services, Portfolio, WhyChooseUs, Testimonials, Contact. All overlines use `SpreadOverline`. Animations trigger via IntersectionObserver.
- **About redesigned with text-on-image composition** (`About.jsx`):
  - Heading "Transform your space / with Urban Interiors" interlocked on the left with a 2-image collage on the right.
  - Body promise paragraph (animated char-by-char) overlaid on the **primary** image inside a dark gradient + "OUR PROMISE" gold overline.
  - **Secondary** image carries "STUDIO NOTE · Located in Chinar Park · Kolkata" at the top + a glass-card italic quote at the bottom.
  - Gold accent frame, soft float animation on the secondary image, gold underline shimmer, mobile-stacked fallback.
- **Bug fix**: corrected leftover `Why Fashion Interior` overline → `Why Urban Interiors`.
- New CSS classes in `/app/frontend/src/index.css`: `fi-split`, `fi-split-word`, `fi-chars-reveal`, `fi-overline-spread`, `fi-shimmer`, `fi-glass-dark`, `fi-glass-light-2`.
- Smoke-tested all sections (1920×800) — animations + layout verified.
