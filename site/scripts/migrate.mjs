#!/usr/bin/env node
// Migration script from the Hugo repository layout to Astro content collections.
// Reads ../content/post, ../content/page/guests and ../static assets and writes
// into src/content/episodes, src/content/guests and public/.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import slugify from 'slugify';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const siteRoot = path.resolve(__dirname, '..');

const srcContent = path.join(siteRoot, 'src', 'content');
const publicDir = path.join(siteRoot, 'public');

slugify.extend({ 'à': 'a', 'è': 'e', 'é': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u', 'È': 'E' });

function toSlug(title) {
  return slugify(title, { lower: true, strict: true, trim: true });
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function copyDir(src, dest, { filter } = {}) {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (filter && !filter(entry.name)) continue;
    await fs.copyFile(path.join(src, entry.name), path.join(dest, entry.name));
  }
}

async function migrateGuests() {
  const guestsSrc = path.join(repoRoot, 'content', 'page', 'guests');
  const guestsDest = path.join(srcContent, 'guests');
  await ensureDir(guestsDest);

  const guestSlugs = [];
  const guestMap = new Map();

  let dirs = [];
  try {
    dirs = await fs.readdir(guestsSrc, { withFileTypes: true });
  } catch {
    console.log('No guest pages found');
    return { guestSlugs, guestMap };
  }

  for (const dir of dirs.filter((d) => d.isDirectory())) {
    const mdPath = path.join(guestsSrc, dir.name, `${dir.name}.md`);
    let raw;
    try {
      raw = await fs.readFile(mdPath, 'utf-8');
    } catch {
      continue;
    }
    const parsed = matter(raw);
    const data = parsed.data || {};
    const slug = (data.slug || dir.name).replace(/^guests\//, '');
    const name = data.title || slug;
    const avatar = data.image || '';
    const bio = data.bio || '';
    const links = {};
    for (const key of ['linkedin', 'github', 'website', 'medium', 'twitter', 'instagram']) {
      if (data[key]) links[key] = data[key];
    }

    const frontmatter = {
      name,
      slug,
      avatar,
      bio,
      ...(Object.keys(links).length ? { links } : {}),
    };
    const body = parsed.content.trim();
    const fileContent = `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n${body ? '\n' + body + '\n' : ''}`;
    await fs.writeFile(path.join(guestsDest, `${slug}.md`), fileContent);
    guestSlugs.push(slug);
    guestMap.set(slug, { name, episodes: data.episodes || {} });
  }

  console.log(`Migrated ${guestSlugs.length} guests`);
  return { guestSlugs, guestMap };
}

async function migrateEpisodes(guestMap) {
  const episodesSrc = path.join(repoRoot, 'content', 'post');
  const episodesDest = path.join(srcContent, 'episodes');
  await ensureDir(episodesDest);

  // Build episode-number -> guest slugs map from old guest pages.
  const episodeGuests = new Map();
  for (const [guestSlug, info] of guestMap.entries()) {
    const episodesObj = info.episodes || {};
    for (const title of Object.keys(episodesObj)) {
      const match = title.match(/pointer\[(\d+)\]/i);
      if (!match) continue;
      const num = parseInt(match[1], 10);
      if (!episodeGuests.has(num)) episodeGuests.set(num, new Set());
      episodeGuests.get(num).add(guestSlug);
    }
  }

  const dirs = await fs.readdir(episodesSrc, { withFileTypes: true });
  let count = 0;
  for (const dir of dirs.filter((d) => d.isDirectory())) {
    const srcFile = path.join(episodesSrc, dir.name, 'index.md');
    let raw;
    try {
      raw = await fs.readFile(srcFile, 'utf-8');
    } catch {
      continue;
    }

    const parsed = matter(raw);
    const data = parsed.data || {};
    if (!data.title) {
      console.warn(`Skipping ${dir.name}: missing title`);
      continue;
    }

    const slug = toSlug(String(data.title));
    if (!slug) {
      console.warn(`Skipping ${dir.name}: empty slug`);
      continue;
    }

    // Add inferred guest references.
    const epNum = typeof data.episode === 'number' ? data.episode : undefined;
    const inferred = epNum !== undefined ? episodeGuests.get(epNum) : undefined;
    if (inferred && inferred.size) {
      data.guests = Array.from(inferred);
    }

    // Clean up a known typo in the old Hugo frontmatter.
    if (typeof data.type === 'string' && data.type.includes('©')) {
      data.type = 'episode';
    }

    const frontmatterYaml = JSON.stringify(data, null, 2);
    const fileContent = `---\n${frontmatterYaml}\n---\n${parsed.content}\n`;
    const destFile = path.join(episodesDest, `${slug}.md`);
    await fs.writeFile(destFile, fileContent);

    // Copy any bundled assets (images, etc.) so relative markdown references keep working.
    const bundleFiles = await fs.readdir(path.join(episodesSrc, dir.name), { withFileTypes: true });
    for (const file of bundleFiles.filter((f) => f.isFile() && f.name !== 'index.md')) {
      await fs.copyFile(
        path.join(episodesSrc, dir.name, file.name),
        path.join(episodesDest, file.name)
      );
    }

    count++;
  }

  console.log(`Migrated ${count} episodes`);
}

async function migrateStaticAssets() {
  const copyJobs = [
    { src: path.join(repoRoot, 'static', 'artworks'), dest: path.join(publicDir, 'artworks') },
    { src: path.join(repoRoot, 'static', 'guest_images'), dest: path.join(publicDir, 'guest_images') },
    { src: path.join(repoRoot, 'static', 'images'), dest: path.join(publicDir, 'images') },
    { src: path.join(repoRoot, 'static', 'hosts'), dest: path.join(publicDir, 'hosts') },
    { src: path.join(repoRoot, 'static', 'social_icons'), dest: path.join(publicDir, 'social_icons') },
  ];

  for (const job of copyJobs) {
    try {
      await fs.access(job.src);
      await copyDir(job.src, job.dest);
      console.log(`Copied ${path.relative(repoRoot, job.src)} -> ${path.relative(siteRoot, job.dest)}`);
    } catch {
      // skip missing
    }
  }

  // Copy the logo used by the sidebar in the old site.
  const logoSrc = path.join(repoRoot, 'static', 'img', 'logo_puntata.png');
  const logoDest = path.join(publicDir, 'images', 'logo_puntata.png');
  try {
    await fs.access(logoSrc);
    await ensureDir(path.dirname(logoDest));
    await fs.copyFile(logoSrc, logoDest);
  } catch {
    // ignore
  }
}

async function createExampleTranscript() {
  const transcriptsDir = path.join(srcContent, 'transcripts');
  await ensureDir(transcriptsDir);
  const example = path.join(transcriptsDir, '299.json');
  try {
    await fs.access(example);
  } catch {
    await fs.writeFile(
      example,
      JSON.stringify(
        [
          { start: 0, end: 12.4, speaker: 'Luca', text: 'Benvenuti al PointerPodcast...' },
          { start: 12.4, end: 25.1, speaker: 'Alessandro', text: 'Oggi parliamo di Fable, Sonnet e molto altro.' },
        ],
        null,
        2
      ) + '\n'
    );
    console.log('Created example transcript for episode 299');
  }
}

async function main() {
  await ensureDir(srcContent);
  await ensureDir(publicDir);

  const { guestMap } = await migrateGuests();
  await migrateEpisodes(guestMap);
  await migrateStaticAssets();
  await createExampleTranscript();
  console.log('Migration complete');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
