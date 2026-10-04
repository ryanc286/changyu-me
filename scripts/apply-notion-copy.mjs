/*
  Apply copy exported from the Notion "文案" database to src/i18n/copy.json.

  Usage: node scripts/apply-notion-copy.mjs rows.json
  rows.json: array of { Key, English, 中文 } (extra columns are ignored).

  - Only English / 中文 are taken from Notion; section and note stay as in copy.json.
  - Fails on unknown keys, missing keys, or a lost link marker ({PAYPAY}, {CAROUSELL}, {AAPD}), so a bad edit
    in Notion never reaches the live site.
*/
import { readFileSync, writeFileSync } from 'node:fs';

const COPY = new URL('../src/i18n/copy.json', import.meta.url);
const copy = JSON.parse(readFileSync(COPY, 'utf8'));
const rows = JSON.parse(readFileSync(process.argv[2], 'utf8'));

// Link markers that must stay in the text (see CopyWithLinks.astro)
const MARKERS = { 'home.intro': 'PAYPAY', 'home.previously': 'CAROUSELL', 'home.outside': 'AAPD' };

const clean = (s) => (s ?? '').replace(/ /g, ' ').trim();
const byKey = new Map(rows.map((r) => [clean(r.Key), r]));
const errors = [];
const changes = [];

for (const k of byKey.keys()) {
  if (!copy.some((e) => e.key === k)) errors.push(`Unknown key in Notion: "${k}"`);
}
for (const entry of copy) {
  const row = byKey.get(entry.key);
  if (!row) {
    errors.push(`Missing in Notion: "${entry.key}"`);
    continue;
  }
  for (const [field, col] of [['en', 'English'], ['zh-tw', '中文']]) {
    const next = clean(row[col]);
    if (next !== entry[field]) {
      changes.push(`${entry.key} [${field}]\n  - ${entry[field]}\n  + ${next}`);
      entry[field] = next;
    }
  }
  const marker = MARKERS[entry.key];
  if (marker) {
    for (const f of ['en', 'zh-tw']) {
      const n = entry[f].split(`{${marker}}`).length - 1;
      if (n !== 1) errors.push(`${entry.key} [${f}] must contain {${marker}} exactly once`);
    }
  }
}

if (errors.length) {
  console.error('Not applied:\n' + errors.map((e) => '  ' + e).join('\n'));
  process.exit(1);
}
writeFileSync(COPY, JSON.stringify(copy, null, 2) + '\n');
console.log(changes.length ? `${changes.length} change(s):\n${changes.join('\n')}` : 'No changes.');
