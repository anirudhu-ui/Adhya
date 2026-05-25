# Project Context – Adhya Insurance Advisor Front‑end

## Overview
The **Adhya** project is a modern, premium‑looking web application that provides an AI‑powered insurance advisory experience.  It is a single‑page front‑end built with **React** (JSX), **motion/react** for smooth animations, and **vanilla CSS** that follows a glass‑morphism, dark‑mode aesthetic.

## Tech Stack
- **HTML** – `index.html` – entry point loading the React bundle.
- **JavaScript / JSX** – React components in `src/pages/`
  - `LandingPage.jsx` – main landing page with animated hero, navigation, statistics, feature grid, journey flow, case studies, and call‑to‑action sections.
- **CSS** – `src/styles/landing.css` – design tokens (colors, fonts, gradients), layout, animations, responsive tweaks.
- **Libraries**
  - `motion/react` – declarative animations (scroll‑based, hover, magnetic button)
  - `lucide-react` – icon set
  - `react-router-dom` – navigation links
- **Build tooling** – assumed Vite/CRA (not shown) that compiles JSX to a bundle referenced by `<script type="module" src="/src/main.jsx"></script>` in `index.html`.

## Key Files (with brief purpose)
| File | Role |
|------|------|
| `index.html` | Minimal HTML shell. Sets meta tags, loads Google fonts, defines a `#root` container, and includes the React entry script. |
| `src/pages/LandingPage.jsx` | Implements the full landing page UI using motion components. Handles scroll‑based transformations, magnetic button interaction, hero animation, navigation, statistics counters, feature cards, journey steps, case studies, and final CTA section. |
| `src/styles/landing.css` | Global styling and design system. Defines CSS variables for colors, fonts, and layout (e.g., `--bg`, `--ink`). Provides glass‑morphism backgrounds, gradient overlays, responsive grid definitions, button styles, marquee animation, and component‑specific classes (`.hero`, `.nav`, `.feat`, `.journey`, etc.). |

## Core Features & Visual Design
- **Animated navigation bar** that sticks and reveals a thin accent line.
- **Hero section** with a background image, blurry vignette, animated headline using `motion` scale/opacity and a glowing cursor effect that follows the mouse.
- **Dynamic statistics** (`CountUp`) that animate numbers once on view.
- **Magnetic buttons** (`MagneticButton`) that react to cursor movement with spring physics.
- **Feature grid** showing four high‑level capabilities (voice‑first, profile‑aware, coverage clarity, privacy).
- **Journey flow** visualising three steps (Ask, Understand, Choose) with animated icons and progress lines.
- **Case‑study carousel** presenting real‑world scenarios.
- **Marquee** (continuous scrolling list of value propositions) using CSS animation.
- **Dark‑mode glass‑morphism** throughout – translucent panels, subtle gradients, and blur filters.

## Design Tokens (from `landing.css`)
```css
:root {
  --ink: #FFFFFF;
  --ink-dim: rgba(255,255,255,0.68);
  --ink-faint: rgba(255,255,255,0.12);
  --bg: #000000;
  --border: rgba(255,255,255,0.08);
  --silver: #FFFFFF;
  --icewhite: #8A8A8A;
  --fd: 'Space Grotesk', sans-serif;
  --fb: 'Inter', system-ui, sans-serif;
}
```
These variables drive the whole UI, making it easy to switch themes.

## Interaction Flow (what the user does)
1. **Landing page loads** – hero animation draws attention.
2. **Scroll** – navigation stays sticky, hero contracts, sections fade/slide in.
3. **Click “SIGN IN” or “GET STARTED”** – routes to `/login` or `/signup` (handled elsewhere).
4. **Explore features** – hover effects highlight icons, buttons pulse.
5. **Read case studies** – cards animate on hover, indicating interactivity.
6. **Footer** – simple copyright and author credit.

## Next Steps / Open Tasks
- Hook up actual authentication routes (`/login`, `/signup`).
- Replace placeholder images (hero background, icons) with final assets.
- Integrate the AI advisor backend (API endpoints for voice/text interactions).
- Add unit / integration tests for components.
- Implement responsive tweaks for very small viewports (mobile breakpoints).

## Repository Location
All source files reside under:
```
c:/Users/aniru/Desktop/vasanthamam/codex/adhya-fixed/frontend/
```
You can open any of the files via the paths shown above.

---
*This `context.md` file is intended to be handed to Claude for a quick project briefing.*
