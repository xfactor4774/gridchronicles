# The Grid Chronicles

> Formula 1 is more than who crossed the line first.

A narrative-driven F1 timeline that captures the drama, politics, and human stories behind two seasons of racing. Not just podiums — transfers, feuds, controversies, and the moments that defined the sport.

![The Grid Chronicles](https://media.formula1.com/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Bahrain%20carbon.png)

## What It Is

A scrolling timeline covering the **2023 and 2024 F1 seasons** — every race result alongside the off-track stories that made those seasons what they were.

- 🏁 **47 races** with full podium data and team colours
- 🔥 **Controversies** — the Horner investigation, Crashgate echoes, team politics
- 🔄 **Driver moves** — Hamilton to Ferrari, Sainz axed, the deals that reshaped the grid
- ⭐ **Milestones** — Verstappen's 4th title, Alonso's renaissance at 41
- 🏳️ **Country flags** for every circuit

## Design

Inspired by Apple's scroll-driven product pages and editorial timelines:

- Full-screen hero with animated intro
- **3-column layout:** sticky year label → date spine → scrolling cards
- Story cards (drama/transfers) are visually dominant — race results are secondary by design
- Slide-in scroll animations via `IntersectionObserver`
- Dark theme, F1 red accents, Playfair Display + Inter

## Stack

Zero dependencies. Pure HTML, CSS, and JavaScript.

- No framework, no build step, no bundler
- Race data pre-baked from [OpenF1 API](https://openf1.org) into `data/races-api.json`
- Off-track editorial events curated by hand (no API for paddock drama)
- Google Fonts: Playfair Display + Inter

## Running Locally

```bash
# Serve locally (needed for fetch() to load JSON)
npx serve .

# Then open:
open http://localhost:3000
```

## Refreshing Race Data

Race results are pre-baked. To update from the OpenF1 API:

```bash
node scripts/fetch-races.mjs 2023 2024
```

This writes to `data/races-api.json`. The API is free, public, no key required.

> **Note:** Ergast API shut down January 2024. OpenF1 is the community replacement.

## Data Structure

```
data/
├── races-api.json   — race results from OpenF1 (47 races, pre-baked)
├── races.json       — original prototype stub
└── events.json      — off-track events stub

scripts/
└── fetch-races.mjs  — refresh script (Node.js, no deps)
```

### Adding editorial stories

In `index.html`, find `RACE_STORIES` to add a narrative blurb to any race by ID (e.g. `'2024-03'`), and `EVENTS` to add new off-track moments.

## Roadmap

- [ ] Extend to 2022 and earlier seasons (Spygate, Crashgate, Multi-21...)
- [ ] More editorial race stories
- [ ] Driver headshot images (already in API data)
- [ ] Search / filter by driver or team
- [ ] Circuit map thumbnails
- [ ] Deploy to Vercel/Netlify

## Credits

- Race data: [OpenF1](https://openf1.org) — open source F1 API
- Flags & circuit images: Formula 1 / FOM
- Built with 🧃 by [Apple Juice](https://github.com/xfactor4774)
