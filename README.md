<div align="center">

# ✦ Novora

### AI-built Shopify stores that actually sell.

A premium, conversion-focused brand and website for an AI-powered Shopify store
creation & automated marketing agency. Built as a high-end, Apple-style
single-page experience with smooth scroll animations — designed to look like a
$20k+ agency site while driving the visitor toward one action: **Get Your Store.**

</div>

---

## ✨ What's inside

A complete brand + a production-ready marketing site:

- **Brand identity** — name, logomark, color system, typography → see [`BRAND-GUIDELINES.md`](BRAND-GUIDELINES.md)
- **Conversion homepage** — hero, problem, benefits, process, offer, comparison, services, stats, pricing, testimonials, guarantees, urgency, FAQ, footer
- **Offer & monetization** — "AI Store Build + Launch", 3 packages, upsells, revenue-share, launch offer
- **SEO** — meta, Open Graph/Twitter cards, JSON-LD (`ProfessionalService` + `FAQPage`)
- **Premium interaction layer** — smooth scroll, scroll reveals, parallax, sticky storytelling, comparison slider, count-ups, magnetic buttons, custom cursor, dark/light themes

## 🧱 Tech & approach

**Zero runtime dependencies.** Hand-built HTML, CSS, and vanilla JS — no
frameworks, no build step, no fragile CDNs. Fast to load, easy to host anywhere,
and guaranteed to render even offline (web fonts degrade gracefully to a
system-font stack).

| Area | How it's done |
|---|---|
| Smooth scroll | Native scroll + eased JS anchor scrolling (Apple-style, accessible) |
| Reveals | `IntersectionObserver`, transform/opacity only (GPU-accelerated) |
| Text reveals | Word-by-word split + staggered transitions |
| Parallax | `requestAnimationFrame` + lerp via the CSS `translate` property (never clobbers `transform`) |
| Sticky section | "Idea → Store → Sales" pins while the visual swaps per active step |
| Comparison | Draggable before/after slider (mouse, touch, keyboard) |
| Micro-interactions | Magnetic buttons, glow-follow cards, custom cursor with labels |
| Performance / a11y | Passive listeners, single rAF tick, full `prefers-reduced-motion` support, semantic HTML, ARIA |

## 📂 Structure

```
.
├── index.html              # The full single-page site
├── css/
│   └── styles.css          # Design system + all components & animations
├── js/
│   └── main.js             # Interaction layer (scroll, reveals, slider, cursor…)
├── assets/
│   ├── logo.svg            # Horizontal logo lockup
│   └── favicon.svg         # App icon / favicon
├── BRAND-GUIDELINES.md     # Brand + offer + SEO + conversion strategy
└── README.md
```

## ▶️ Run it locally

It's static — just open `index.html`, or serve the folder:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then visit **http://localhost:8000**.

> Tip: toggle 🌗 in the navbar for light/dark. Drag the slider in the
> "Same platform. Completely different outcome." section to compare a typical
> DIY store against a Novora-built one.

## 🚀 Deploy

Drag-and-drop or point any static host at the repo root:
**Netlify · Vercel · Cloudflare Pages · GitHub Pages · Shopify** (as a custom section).

## 📝 Notes

- Testimonials, stats, and brand logos are **illustrative placeholders** for the
  template; swap in real assets before going live.
- Replace `https://novora.io/` and the OG image path with your production domain.
- "Novora" is a coined name created for this brand concept; check trademark
  availability before commercial use.

<div align="center"><sub>Designed & built to convert. ✦</sub></div>
