# ✦ Glowave — LED store landing page

A single-file, conversion-focused landing page for a (dropshipping) smart **RGBIC
LED strip** brand. Self-contained: open `index.html` in any browser or drop it on
any host — no build step, no framework, no `node_modules`.

This matches the repo's philosophy (hand-built HTML/CSS/vanilla JS, zero runtime
dependencies), so the four requested React/shadcn components were **ported to
vanilla JS/CSS** rather than scaffolding a separate React project.

## Integrated components

| Source component (React) | Where it lives now | Section |
|---|---|---|
| `container-scroll-animation` (Framer Motion) | vanilla scroll handler → `rotateX`/`scale`/`translateY` | "See it in your space" 3D showcase (`#showcase`) |
| `splite` + `spotlight` + `card` (Spline) | `<spline-viewer>` web component, lazy-loaded, + animated spotlight SVG | "Meet the app" (`#app3d`) |
| `display-cards` (lucide-react) | CSS-only fanned/skewed stack | "Scenes" (`#scenes`) |
| `ink-reveal` (canvas) | vanilla canvas + mouse/touch handlers | "Before & after" reveal (`#reveal`) |

All animation respects `prefers-reduced-motion`.

## External assets (all degrade gracefully)

- **Fonts** — Unbounded + Space Grotesk via Google Fonts.
- **Spline 3D scene** — loaded from `unpkg.com` + `prod.spline.design`. If blocked,
  an animated spectrum orb shows instead. Swap the `url` in the lazy-loader for your
  own product scene.
- **Unsplash photos** (showcase + reveal) — each `<img>` has an `onerror` fallback to
  an on-brand gradient, so a 404 never shows a broken image. Replace these with real
  product/room photography before launch.

## Customize

- Colors: edit the CSS variables in `:root` (`--pink`, `--violet`, `--cyan`, …).
- Pricing/bundles: edit the `.bundle` blocks (`data-price` / `data-was` drive the
  cart button + sticky mobile bar) and the `Product` JSON-LD in `<head>`.
- Countdown: the offer timer is set in the `// countdown` IIFE near the bottom.

## Want the real React/shadcn versions instead?

If this ever moves into a React app, set it up with:

```bash
npx create-next-app@latest my-store --ts --tailwind --app
cd my-store
npx shadcn@latest init          # creates components.json -> components live in components/ui
npx shadcn@latest add card
npm i framer-motion @splinetool/react-spline @splinetool/runtime lucide-react
```

Then drop the original `.tsx` files into `components/ui/` (the path shadcn maps to
`@/components/ui`, which every `import "@/components/ui/..."` in those files expects).
