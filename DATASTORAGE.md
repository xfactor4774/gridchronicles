# Off-Track — Data Storage

## Current (Prototype)

Data lives in two flat JSON files:

```
data/
├── races.json   — race results (podium, date, circuit, story)
└── events.json  — off-track events (drama, transfers, milestones)
```

Both are inlined into `index.html` as JS constants so it works from `file://` without a server.

### races.json schema
```json
{
  "id": "2024-01",          // season-round
  "season": 2024,
  "round": 1,
  "name": "Bahrain Grand Prix",
  "date": "2024-03-02",     // ISO 8601
  "circuit": "Bahrain International Circuit",
  "location": "Sakhir, Bahrain",
  "podium": [
    { "position": 1, "driver": "Max Verstappen", "team": "Red Bull Racing" },
    { "position": 2, "driver": "Carlos Sainz", "team": "Ferrari" },
    { "position": 3, "driver": "Charles Leclerc", "team": "Ferrari" }
  ],
  "story": "Narrative text for the race card."
}
```

### events.json schema
```json
{
  "id": "event-001",
  "date": "2024-02-15",
  "type": "controversy",    // controversy | driver move | milestone
  "title": "Horner Investigation",
  "description": "Narrative text.",
  "category": "team politics",
  "severity": "high"        // high | medium | low
}
```

---

## Production Plan

### Race results → OpenF1 API
Ergast API was shut down in January 2024. The replacement is:

**OpenF1** — https://api.openf1.org (free, real-time, no auth needed)

Useful endpoints:
```
# Race sessions
GET https://api.openf1.org/v1/sessions?session_type=Race&year=2024

# Race results (position data)
GET https://api.openf1.org/v1/position?session_key=9158&position<=3

# Driver info
GET https://api.openf1.org/v1/drivers?session_key=9158
```

For historical data pre-2023, Ergast's final data dump is still available at:
https://ergast.com/api/f1/{season}/{round}/results.json

### Off-track events → Manual curation
There's no API for drama. The `events.json` file is manually curated — keep it that way. It's the editorial heart of Off-Track.

---

## Scaling

When ready to go beyond prototype:
1. Move data out of inline JS back into `data/*.json`
2. Add a simple build step (or a tiny Express server) to serve files
3. Write a script to pull OpenF1 race results into `races.json` automatically
4. Add a `seasons/YYYY.json` structure for larger datasets

Adding a new race: copy an existing entry in `races.json`, update fields, add story.
Adding an event: copy an entry in `events.json`, set type to `controversy`, `driver move`, or `milestone`.
