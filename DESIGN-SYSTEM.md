# Magic Six Technical Services FZC — Design System & Asset Plan
**Phase 1 Deliverable · v1.0 · July 2026**

---

## 1. Design Direction

**Positioning statement:** A government-grade UAE engineering brand that reads like Siemens' precision wearing Bentley's tailoring.

**Signature element:** The hexagonal facet geometry of the Magic Six logo mark. The "6" in the logo is constructed from angular, hexagonal tower silhouettes — this geometry becomes the site's DNA:

- Hexagonal clip-path frames on imagery (About, Projects, team photos)
- Hex-lattice ambient particle field in the hero (SVG, GPU-cheap, respects `prefers-reduced-motion`)
- Angled/faceted section dividers (not generic waves)
- Service icons set inside hexagonal gold-stroked frames
- Hexagon bullet markers replacing standard list dots
- The stat counters sit on faceted card shapes

Everything else stays quiet and disciplined so this one idea carries the identity.

---

## 2. Color System

### Brand anchors (from brief)
| Token | Hex | Role |
|---|---|---|
| `--navy-900` | `#0B2D5C` | Primary — headings, dark sections |
| `--royal-700` | `#123D8C` | Secondary — buttons, links, accents |
| `--gold-500` | `#C8A85D` | Luxury accent — CTAs hover, dividers, highlights |

### Derived ramp (needed for a working system)
| Token | Hex | Role |
|---|---|---|
| `--navy-950` | `#061B3A` | Footer / CTA band / dark-mode base |
| `--navy-800` | `#0E3670` | Gradient stops, hover on navy |
| `--royal-600` | `#1A4DAD` | Button hover (before gold state) |
| `--royal-100` | `#E8EEF9` | Tinted card backgrounds, icon chips |
| `--gold-400` | `#D7BC7E` | Gold hover / gradient light stop |
| `--gold-600` | `#A8894A` | Gold pressed / borders on light bg |
| `--ink-900` | `#0A1F3D` | Body headings (dark navy text) |
| `--ink-600` | `#3D4E6B` | Body copy |
| `--ink-400` | `#6B7A94` | Muted / captions |
| `--mist-50` | `#F6F8FB` | Alternate section background |
| `--mist-100` | `#EDF1F7` | Card backgrounds, input fills |
| `--line-200` | `#DCE3EE` | Borders, hairlines |
| `--white` | `#FFFFFF` | Base background |

### Gradients & effects
- **Navy depth:** `linear-gradient(160deg, #0B2D5C 0%, #061B3A 100%)` — hero overlay, CTA band
- **Gold sheen:** `linear-gradient(120deg, #A8894A, #C8A85D 45%, #E5D3A3 55%, #C8A85D)` — animated on gold CTAs (slow shimmer)
- **Glass:** `background: rgba(255,255,255,0.08); backdrop-filter: blur(18px); border: 1px solid rgba(200,168,93,0.25)` — nav on scroll, testimonial cards

### Contrast validation (WCAG 2.2 AA)
- `#0A1F3D` on `#FFFFFF` → 15.6:1 ✓
- `#FFFFFF` on `#123D8C` → 9.5:1 ✓
- `#C8A85D` on `#061B3A` → 6.1:1 ✓ (gold is used on dark navy only, never on white for text — on white it's decorative or paired with navy text)

### Dark mode
Inverts to `--navy-950` base, `--mist-100` text, gold unchanged. Implemented via `[data-theme="dark"]` overriding the same custom properties — zero duplicate component CSS.

---

## 3. Typography

| Role | Face | Weights | Notes |
|---|---|---|---|
| Display / headings | **Poppins** | 600, 700 | Tight tracking `-0.02em` on ≥ h2 |
| Body / UI | **Inter** | 400, 500, 600 | Variable font, `font-optical-sizing: auto` |
| **Arabic** | **Tajawal** | 400, 500, 700 | Geometric Arabic that pairs with Poppins; all Arabic strings get `lang="ar" dir="rtl"` |

> ⚠ Poppins/Inter contain no Arabic glyphs — Tajawal is required, not optional. Loaded via one combined Google Fonts request with `display=swap`.

### Fluid type scale (clamp-based, 8px-aligned)
| Token | Value | Usage |
|---|---|---|
| `--fs-hero` | `clamp(2.75rem, 6.5vw, 5rem)` | Hero headline |
| `--fs-h2` | `clamp(2rem, 4vw, 3.25rem)` | Section titles |
| `--fs-h3` | `clamp(1.375rem, 2.2vw, 1.75rem)` | Card titles |
| `--fs-lead` | `clamp(1.0625rem, 1.4vw, 1.25rem)` | Subheadings, intros |
| `--fs-body` | `1rem / 1.7` | Body copy |
| `--fs-small` | `0.875rem` | Captions, footer |
| `--fs-eyebrow` | `0.8125rem`, `letter-spacing: 0.18em`, uppercase, gold | Section labels |

---

## 4. Spacing, Radius, Elevation, Motion

### Spacing (8px grid)
`--sp-1: 8px` → `--sp-12: 96px`, plus `--section-y: clamp(80px, 10vw, 144px)` and `--container: min(1200px, 92vw)`.

### Radius
| Token | Value | Usage |
|---|---|---|
| `--r-sm` | `8px` | Inputs, chips |
| `--r-md` | `16px` | Cards |
| `--r-lg` | `24px` | Feature panels, images |
| `--r-pill` | `999px` | Buttons, tags |
| `--r-hex` | hexagon `clip-path` | Signature frames |

### Shadows
- `--sh-soft: 0 8px 30px rgba(11,45,92,0.08)` — resting cards
- `--sh-lift: 0 20px 50px rgba(11,45,92,0.16)` — hover
- `--sh-gold: 0 8px 30px rgba(200,168,93,0.35)` — gold CTA hover glow

### Motion tokens
| Token | Value | Usage |
|---|---|---|
| `--t-fast` | `180ms` | Hovers, focus |
| `--t-med` | `350ms` | Card lifts, nav blur |
| `--t-slow` | `700ms` | Section reveals (AOS) |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` | Everything — one easing, site-wide consistency |

All animation wrapped in `@media (prefers-reduced-motion: no-preference)`. GSAP for hero orchestration + counters + timeline; AOS for scroll reveals; Swiper for testimonials and logo slider.

---

## 5. Component Inventory

| Component | Variants | Key behaviors |
|---|---|---|
| Buttons | Gold (primary CTA), Royal (secondary), Ghost-light (on dark) | Ripple on click, gold shimmer, 44px min touch target |
| Header | Transparent → glass on scroll | Blur 18px, gold CTA, off-canvas mobile menu with staggered link reveal |
| Service card | 6 services, bilingual | Image zoom 1.06, hex icon rotates 8°, gold underline sweep, EN + AR labels |
| Why-us card | 8 items | Icon chip lift, border → gold on hover |
| Process timeline | 5 steps | GSAP-drawn connecting line, hexagon step markers |
| Project tile | Masonry, 6 filter categories | Filter with FLIP animation, navy gradient overlay + category tag on hover |
| Testimonial card | Glass | Swiper, 5-star gold rating, auto-height |
| Stat counter | 4 stats | GSAP count-up on scroll into view, faceted card |
| Before/after slider | Maintenance projects | Pointer-drag divider, keyboard accessible |
| Forms | Contact | Floating labels, gold focus ring, inline validation |
| Footer | 4-column | Logo, links, contact, map embed, social |
| Floating widgets | WhatsApp, back-to-top, contact | Appear after 600px scroll |
| Cursor glow | Desktop only | Disabled on touch + reduced-motion |

---

## 6. Asset Plan

### SVG (hand-built in Phase 5)
1. **Logo mark** — faithful inline SVG recreation of the hexagonal "6" (navy + gold variants + white knockout for dark sections)
2. Hex-lattice hero background pattern (animated opacity drift)
3. Faceted section dividers (top/bottom, navy/white/mist variants)
4. 6 service icons (line style, 1.75px stroke, hexagonal frames): facility, tiling, plumbing, instrumentation, cleaning, electrical/structural
5. 8 why-us icons + 5 process icons + 8 industry icons
6. Dubai skyline line-art (footer / CTA band accent)
7. Favicon set from the hex "6" mark (SVG + PNG 32/180/512)

### Imagery (premium placeholders, consistent grade)
Unsplash source URLs, all treated with a unified navy-tint overlay (`mix-blend-mode` or gradient) so mixed photography reads as one shoot:
- Hero: Dubai skyline dusk / electrical infrastructure
- About: engineering team, control room
- Services ×6: panels, tiling, plumbing, instrumentation, cleaning crew, construction
- Projects ×9: towers, MEP rooms, facilities
- Testimonial avatars ×3–4

### Third-party (CDN, deferred/lazy)
Bootstrap 5 (grid + utilities only, visual styles overridden), GSAP + ScrollTrigger, AOS, Swiper 11, Font Awesome 6 (supplemented by custom SVGs), Google Fonts (Poppins + Inter + Tajawal, one request).

---

## 7. Page Architecture (locked from brief)

Loader → Sticky glass header → Hero (full-screen, animated stats) → About (split, hex-framed imagery) → Services (6 bilingual cards) → Why Us (8 cards) → Process (5-step timeline) → Projects (filterable masonry) → Industries (8 sectors) → Testimonials (glass Swiper) → CTA band (dark navy, gold button) → Footer → Floating widgets.

SEO: full meta/OG/Twitter set, Organization + LocalBusiness + FAQ + Breadcrumb schema (JSON-LD), semantic landmark structure, single `<h1>`.

---

## Phase Checklist

- [x] **Phase 1 — Design system & asset plan** (this document)
- [ ] Phase 2 — `index.html` (complete semantic structure, all sections, schema, meta)
- [ ] Phase 3 — `style.css` (tokens → components → sections → responsive → dark mode)
- [ ] Phase 4 — `script.js` (loader, GSAP, AOS init, filters, sliders, widgets, theme toggle)
- [ ] Phase 5 — SVG assets (logo recreation, icons, dividers, favicon)
- [ ] Phase 6 — Audit pass (Lighthouse targets, WCAG 2.2 AA sweep, SEO verification)
