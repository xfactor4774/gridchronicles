# The Grid Chronicles — Build Log

## Project
A narrative-driven Formula 1 timeline website. Beyond the podium — the transfers, feuds, dominance, and shocks of two seasons of F1.

---

## Session 1 — 2026-02-15

### Concept & Name
- **Origin:** Vlad's idea to build an F1 timeline that tells the story beyond race results
- **Initial name:** Off-Track (double meaning: off the race track + the drama that happens off it)
- **Final name:** TheGridChronicles — more editorial, more brand-ready
- **Inspiration:** Apple product page scroll UX + Shorthand visual timelines

### Data Layer
- **Race results:** [OpenF1 API](https://openf1.org) — free, public, no auth required
  - Ergast API shut down Jan 2024; OpenF1 is the community replacement
  - Endpoints used: `/sessions`, `/meetings`, `/position`, `/drivers`
  - Fetch strategy: pre-bake races to `data/races-api.json` via `scripts/fetch-races.mjs` (not live API calls on page load)
  - Rate limiting: 429s on first run — added exponential backoff (2s, 4s, 6s, 8s retries)
- **Off-track events:** Manually curated `EVENTS` array in `index.html` — no API for paddock drama
- **Data fetched:** 47 races across 2023 (23 races) and 2024 (24 races), complete with podium, team colours, country flags, circuit images

### Tech Stack
- Pure HTML + CSS + JS — no build step, no npm, no framework
- `npx serve` for local dev server (needed for `fetch()` to load JSON from same origin)
- Google Fonts: Playfair Display (editorial serif) + Inter (UI sans)
- Zero dependencies in production

### UX Design
- **Hero:** Full-screen with subtle grid texture, red radial glow, animated fade-up text, scroll cue with growing red line
- **3-column chapter layout:**
  - Col 1: Sticky year label (Playfair, vertical, glows red when chapter is active)
  - Col 2: Spine column — thin vertical line (grey → red on active), date nodes with day/month labels
  - Col 3: Scrolling card feed
- **Scroll animations:** IntersectionObserver — cards slide in from right as they enter viewport
- **Spine sync:** JS pass after fonts load syncs spine node heights to matching card heights
- **Story cards (drama/transfers/milestones):** Full editorial treatment — Playfair title, body copy, coloured left border (orange/purple/green)
- **Race cards:** Deliberately secondary — compact, grey, round number as dim numeral, team colour dots on podium
- **Country flags:** Real F1.com flag images from OpenF1 API data, inline on race location

### Editorial Events (curated)
| Date | Type | Title |
|------|------|-------|
| 2024-02-15 | Controversy | The Horner Investigation |
| 2023-12-01 | Driver Move | Hamilton to Ferrari |
| 2023-11-19 | Milestone | Verstappen's Fourth Title |
| 2023-09-15 | Driver Move | Sainz Axed for Hamilton |
| 2023-03-20 | Milestone | Alonso's Renaissance |

### Files
```
gridchronicles/
├── index.html              — main app (HTML + CSS + JS, self-contained)
├── data/
│   ├── races-api.json      — pre-baked race data from OpenF1 API (47 races)
│   ├── races.json          — original prototype stub data
│   └── events.json         — off-track events stub
├── scripts/
│   └── fetch-races.mjs     — Node.js script to refresh race data from OpenF1
├── BUILDLOG.md             — this file
└── DATASTORAGE.md          — data architecture notes

```

### Next Steps (ideas)
- [ ] Add more editorial stories per race (the `RACE_STORIES` map in index.html)
- [ ] Extend to 2022 and earlier seasons
- [ ] Add race winner headshot images (already fetched in API data)
- [ ] Search / filter by driver or team
- [ ] Deploy to Vercel/Netlify as static site
- [ ] Add more drama events — Crashgate, Spygate, Multi-21, etc.
- [ ] Mobile polish pass
- [ ] Circuit map thumbnails (already in API data as `circuitImage`)
