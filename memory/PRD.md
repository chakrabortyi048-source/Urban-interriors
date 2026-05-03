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


## Feb 2026 — About section full-bleed 3D redesign
- **Dining room image** (`milhfp56_Screenshot_2026-04-30_175818.jpg`) is now the **full-bleed background** of the About section (min-height 110vh, subtle scroll parallax).
- Cinematic vignette + top/bottom dark gradients for text legibility; 3 animated gold particle dots for depth.
- All About texts now sit **inside the background**:
  - Large headline "Transform your space / with Urban Interiors." with 3D glow text-shadow, animates in from deep Z (translateZ(-200px) → 0, rotateX(-14deg) → 0) on scroll, then drifts with `fi-float3d-a`.
  - Body paragraph with "URBAN INTERIORS" rendered as gradient-gold background-clip text.
  - **Studio Note glass card** on the right (backdrop-filter blur, gold left-border, drifts with `fi-float3d-c`).
  - Four **Pillar glass cards** at the bottom, each floating with a different 3D cycle and staggered delays.
- New CSS: `fi-3d-stage` (perspective 1400px), `fi-3d-layer`, `fi-3d-in`, keyframes `fi-float3d-a..d`, text helpers `fi-text-3d-glow`, `fi-text-3d-gold`.
- Rest of the site (Hero, Portfolio, Services, Why Us, Reviews, Contact, Footer) **unchanged**.


## Feb 2026 — About mobile fit + mouse-tilt parallax
- **Mobile fix**: the About image (1:1 square 720×711) was cropping on phones. Now fills full width at natural aspect anchored to top with `object-contain`, gradient-fades into the dark section body; all texts flow below *inside the same dark backdrop*. Section min-height = `calc(100vw + 680px)`.
- **Desktop** remains full-bleed immersive with `object-cover`.
- **Mouse-tilt parallax** (desktop, `pointer: fine` only):
  - Background image parallaxes subtly with cursor X/Y.
  - Headline tilts in 3D (rotateX/Y) opposite to cursor → depth illusion.
  - Studio Note card + each pillar tilt with varied multipliers → layers shear convincingly.
  - Throttled via `requestAnimationFrame`; disabled on touch pointers.


## Feb 2026 — Premium Gold Cursor + Scroll-to-Explore Rail
- `/app/frontend/src/components/site/PremiumCursor.jsx`:
  - Custom cursor on `pointer:fine` + `hover:hover` devices (auto-disabled on mobile).
  - Gold outer ring (32px) + inner gold dot (6px), eased lerp motion.
  - Ring **magnetizes** (56px, gold fill, stronger glow) on hover over `a`, `button`, `input`, `textarea`, `[role=button]`, `[data-cursor=magnet]`, `.cursor-pointer-fi`.
  - Ring contracts on mousedown.
  - **Scroll-to-explore rail** on right edge: gold track + glowing gold fill + vertical "SCROLL" label.
- Wired into `HomePage.jsx` as first child.
- CSS classes added to `/app/frontend/src/index.css`: `.fi-cursor-ring`, `.fi-cursor-dot`, `.fi-scroll-rail*`, and `html.fi-premium-cursor *` cursor-hiding (preserves text caret).


## Feb 2026 — Hero redesign: bright high-res image + next-level text animations
- **New high-res hero asset** (`sxh3shl9_IMG-20260501-WA0025.jpg`, 712×1400 portrait).
- **Desktop split layout**: the image (formerly cropped to dim murk by `object-cover` on a 16:9 viewport) now lives on the right column at its native portrait aspect — the **full living room is visible at full brightness** with no heavy overlay, framed by a gold pulsing halo, gold corner brackets that animate in, and a "Recent Project · 2025" floating tag. Text content lives in the left column.
- **Mobile**: still uses the image as a full-bleed cover background (matching what the user wanted on phones).
- **Next-level text animations on the hero**:
  - Headline words fly in from below with `rotateX(-90deg) → 0` + blur(8px) → 0 entrance (`fi-hero-word-3d`), staggered 160ms each.
  - The accent word "Story." is rendered with an **infinite gold-shimmer sweep** (`fi-gold-shine`).
  - Subtitle text uses **typewriter char-fade** with rotateX-30 → 0 + blur per character (`fi-typewriter`).
  - Vertical "Painting · Furniture · Flooring · Landscape" text cascades letter by letter (`fi-vert-cascade`).
  - "Kolkata · Chinar Park" overline cascades in with letter-spread + gold glow.
  - Animated gold accent line sweeps out from left.
  - Image entrance: rises in over 1.4s, corner brackets pop in with staggered delays.
  - Buttons get an **aurora ripple** burst on hover.
- New CSS: `fi-hero3d-stage`, `fi-hero3d-word`, `fi-hero-word-3d`, `fi-gold-shine`, `fi-typewriter`, `fi-vert-cascade`, `fi-halo-pulse`, `fi-aurora-ripple`, `.fi-corner.tl/tr/bl/br`.


## Feb 2026 — Gold Sparkle Sprinkle on Headings + Subtitles
- New global component `/app/frontend/src/components/site/GoldSprinkle.jsx`:
  - On desktop only (`pointer:fine` + `hover:hover`). Listens for `mousemove`.
  - When cursor enters any element with class `fi-glow-text`, the heading/subtitle gains a soft multi-layer gold halo via `text-shadow`; gold sparkle particles spawn at cursor position, drift upward at random angle, fade over 700–1200ms.
  - Throttled at 38ms; auto-cleans nodes; resets on document `mouseleave`.
- `SplitHeading` + `CharReveal` auto-include `fi-glow-text`. Manually tagged on Hero headline+subtitle, About body paragraphs, and section descriptions.
- New CSS: `.fi-sparkle`, `@keyframes fi-sparkle-drift`, `.fi-glow-text.is-glowing`, `@media (hover:none)` disable rule.
- Wired into `HomePage.jsx` after `PremiumCursor`.
