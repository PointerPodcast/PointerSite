#!/usr/bin/env node
// Import transcripts from the PointerSet repository into the Astro content collection.
// Reads /Users/lucacorbucci/Documents/GitHub/PointerSet/transcriptions and writes
// src/content/transcripts/<episode>.json in the schema expected by the site.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, '..');
const transcriptsRepo = '/Users/lucacorbucci/Documents/GitHub/PointerSet/transcriptions';
const destDir = path.join(siteRoot, 'src', 'content', 'transcripts');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function parseEpisodeNumber(dirName) {
  const num = parseInt(dirName, 10);
  return Number.isNaN(num) ? undefined : num;
}

async function importTranscripts() {
  await ensureDir(destDir);
  const entries = await fs.readdir(transcriptsRepo, { withFileTypes: true });
  let count = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const episode = parseEpisodeNumber(entry.name);
    if (episode === undefined) {
      console.log(`Skipping non-numeric directory: ${entry.name}`);
      continue;
    }

    const dirPath = path.join(transcriptsRepo, entry.name);
    const files = (await fs.readdir(dirPath)).filter((f) => f.endsWith('.txt'));
    if (files.length === 0) {
      skipped++;
      continue;
    }

    const srcFile = path.join(dirPath, files[0]);
    const raw = await fs.readFile(srcFile, 'utf-8');
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.warn(`Failed to parse ${srcFile}: ${err.message}`);
      skipped++;
      continue;
    }

    const speakers = Array.isArray(data.speakers) ? data.speakers : Array.isArray(data) ? data : [];
    const segments = speakers
      .filter((s) => Array.isArray(s.timestamp) && s.timestamp.length === 2 && typeof s.text === 'string')
      .map((s, i, arr) => {
        let start = typeof s.timestamp[0] === 'number' ? s.timestamp[0] : 0;
        let end = typeof s.timestamp[1] === 'number' ? s.timestamp[1] : undefined;
        if (end === undefined || end === null || Number.isNaN(end)) {
          // Some transcripts end with a null end timestamp; use the next segment's start or the same start.
          end = arr[i + 1]?.timestamp?.[0] ?? start;
        }
        return {
          start,
          end,
          speaker: typeof s.speaker === 'string' ? s.speaker : undefined,
          text: s.text.trim(),
        };
      });

    const output = { episode, segments };
    await fs.writeFile(path.join(destDir, `${episode}.json`), JSON.stringify(output, null, 2));
    count++;
  }

  console.log(`Imported ${count} transcripts to ${path.relative(siteRoot, destDir)}`);
  if (skipped) console.log(`Skipped ${skipped}`);
}

importTranscripts().catch((err) => {
  console.error(err);
  process.exit(1);
});
