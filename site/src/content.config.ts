import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: z.object({
    title: z.string(),
    description: z.string().nullish().transform((v) => v ?? ''),
    date: z.coerce.date(),
    categories: z.array(z.string()).default([]),
    episode: z.coerce.number().optional(),
    podcast: z.string().optional(),
    type: z.string().optional(),
    artwork: z.string().optional(),
    duration: z.coerce.string().optional(),
    guests: z.array(z.string()).default([]),
    transcript: z.string().optional(),
    audioUrl: z.string().optional(),
  }),
});

const guests = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guests' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
    links: z.record(z.string(), z.string()).default({}),
  }),
});

const transcripts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/transcripts' }),
  schema: z.object({
    episode: z.number(),
    segments: z.array(
      z.object({
        start: z.number(),
        end: z.number(),
        speaker: z.string().optional(),
        text: z.string(),
      })
    ),
  }),
});

export const collections = { episodes, guests, transcripts };
