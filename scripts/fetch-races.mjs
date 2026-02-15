#!/usr/bin/env node
/**
 * fetch-races.mjs
 * Fetches race results from OpenF1 API for specified years
 * and writes to data/races-api.json
 *
 * Usage: node scripts/fetch-races.mjs [year1] [year2] ...
 * Default: node scripts/fetch-races.mjs 2023 2024
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, '..', 'data', 'races-api.json');

const BASE = 'https://api.openf1.org/v1';
const YEARS = process.argv.slice(2).map(Number).filter(Boolean);
if (!YEARS.length) YEARS.push(2023, 2024);

async function get(url, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status === 429 && attempt < retries) {
      const wait = 2000 * (attempt + 1); // 2s, 4s, 6s, 8s
      process.stdout.write(`[429 retry in ${wait/1000}s] `);
      await sleep(wait);
      continue;
    }
    throw new Error(`API error ${res.status}: ${url}`);
  }
}

// Sleep to avoid hammering the API
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function getFinalPositions(sessionKey) {
  // Get all position entries for top 3 at end of race
  // Strategy: get the LAST position record for each driver by fetching
  // all positions and finding the final entry per driver_number
  const data = await get(`${BASE}/position?session_key=${sessionKey}`);

  // Group by driver, keep last entry
  const finalPos = {};
  for (const entry of data) {
    finalPos[entry.driver_number] = entry.position;
  }

  // Get drivers P1, P2, P3
  const podiumNumbers = Object.entries(finalPos)
    .filter(([, pos]) => pos <= 3)
    .sort(([, a], [, b]) => a - b)
    .map(([num]) => Number(num));

  return { finalPos, podiumNumbers };
}

async function getDrivers(sessionKey) {
  const data = await get(`${BASE}/drivers?session_key=${sessionKey}`);
  const map = {};
  for (const d of data) {
    map[d.driver_number] = {
      name: d.full_name.replace(/([A-Z]+)$/, m => m[0] + m.slice(1).toLowerCase()),
      team: d.team_name,
      colour: d.team_colour,
      acronym: d.name_acronym,
      headshot: d.headshot_url,
    };
  }
  return map;
}

async function processYear(year) {
  console.log(`\n📅 Fetching ${year} season...`);

  // Get all race sessions for the year
  const sessions = await get(`${BASE}/sessions?session_type=Race&year=${year}`);
  // Filter to actual races (not sprints — session_name === 'Race')
  const races = sessions.filter(s => s.session_name === 'Race');
  console.log(`  Found ${races.length} races`);

  // Get meeting info for race names
  const meetings = await get(`${BASE}/meetings?year=${year}`);
  const meetingMap = {};
  for (const m of meetings) {
    meetingMap[m.meeting_key] = {
      name: m.meeting_name,
      location: m.location,
      country: m.country_name,
      countryCode: m.country_code,
      flag: m.country_flag,
      circuitImage: m.circuit_image,
    };
  }

  const results = [];

  for (let i = 0; i < races.length; i++) {
    const session = races[i];
    const meeting = meetingMap[session.meeting_key] || {};
    const round = i + 1;

    process.stdout.write(`  [${round}/${races.length}] ${meeting.name || session.circuit_short_name}... `);

    try {
      const [{ finalPos, podiumNumbers }, drivers] = await Promise.all([
        getFinalPositions(session.session_key),
        getDrivers(session.session_key),
      ]);

      const podium = podiumNumbers.slice(0, 3).map(num => ({
        position: finalPos[num],
        driver: drivers[num]?.name || `#${num}`,
        team: drivers[num]?.team || 'Unknown',
        colour: drivers[num]?.colour || '888888',
        acronym: drivers[num]?.acronym || `${num}`,
        headshot: drivers[num]?.headshot || null,
      }));

      results.push({
        id: `${year}-${String(round).padStart(2, '0')}`,
        season: year,
        round,
        sessionKey: session.session_key,
        meetingKey: session.meeting_key,
        name: meeting.name || `Round ${round}`,
        date: session.date_start.split('T')[0],
        location: meeting.location || session.location,
        country: meeting.country || '',
        countryCode: meeting.countryCode || '',
        flag: meeting.flag || null,
        circuitImage: meeting.circuitImage || null,
        podium,
        story: null, // To be filled manually in events.json or stories layer
      });

      console.log(`✓ (P1: ${podium[0]?.driver || '?'})`);
    } catch (err) {
      console.log(`✗ Error: ${err.message}`);
      results.push({
        id: `${year}-${String(round).padStart(2, '0')}`,
        season: year,
        round,
        name: meeting.name || `Round ${round}`,
        date: session.date_start.split('T')[0],
        location: meeting.location || session.location,
        podium: [],
        story: null,
        error: err.message,
      });
    }

    // Polite pause between requests — longer to avoid 429s
    if (i < races.length - 1) await sleep(800);
  }

  return results;
}

async function main() {
  console.log(`🏎️  OpenF1 Race Fetcher — years: ${YEARS.join(', ')}`);

  const allRaces = [];
  for (const year of YEARS) {
    const races = await processYear(year);
    allRaces.push(...races);
  }

  // Sort newest first
  allRaces.sort((a, b) => b.date.localeCompare(a.date));

  mkdirSync(join(__dir, '..', 'data'), { recursive: true });
  writeFileSync(OUT, JSON.stringify({ races: allRaces, fetchedAt: new Date().toISOString() }, null, 2));

  console.log(`\n✅ Done! ${allRaces.length} races written to data/races-api.json`);
  console.log(`   Next: add story text to data/stories.json for editorial layer`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
