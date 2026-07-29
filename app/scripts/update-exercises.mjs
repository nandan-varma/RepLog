// Refreshes the bundled exercise dataset from free-exercise-db.
// Run with: node scripts/update-exercises.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const API_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const OUTPUT_PATH = fileURLToPath(new URL('../src/data/exercises.json', import.meta.url));

const res = await fetch(API_URL);
if (!res.ok) throw new Error(`Failed to fetch ${API_URL}: ${res.status}`);
const exercises = await res.json();

writeFileSync(OUTPUT_PATH, JSON.stringify(exercises));
console.log(`Wrote ${exercises.length} exercises to ${OUTPUT_PATH}`);
