// Site-wide configuration. These values can be overridden with environment
// variables where noted, which is useful for preview/staging deploys.

export const SITE = {
  title: 'PointerPodcast',
  tagline: 'Puntatori alla tecnologia',
  description:
    'Il PointerPodcast è un podcast italiano dedicato agli appassionati di tecnologia e innovazione.',
  url: import.meta.env.PUBLIC_SITE_URL || 'https://pointerpodcast.it',
  language: 'it',
  since: 2019,
  copyright: 'PointerPodcast',
  email: 'info@pointerpodcast.it',
} as const;

// Where the MP3 files are hosted. The `podcast` frontmatter field is just the
// filename; this base URL is prepended to build the final audio src.
export const PODCAST_HOST =
  import.meta.env.PUBLIC_PODCAST_HOST ||
  'https://pub-da006a9d0ee0431aa1c63a049ea51ab1.r2.dev/';

export const SOCIAL = {
  spotify: 'https://open.spotify.com/show/3XmDzcZv4rCIx1VpWrbrkh',
  apple: 'https://podcasts.apple.com/it/podcast/pointerpodcast/id1465505870',
  telegram_group: 'https://t.me/pointerpodcastgruppo',
  telegram_channel: 'https://t.me/PointerPodcast',
  youtube: 'https://www.youtube.com/@pointerpodcast',
  twitch: 'https://www.twitch.tv/pointerpodcast',
  instagram: 'https://www.instagram.com/pointerpodcast/',
  twitter: 'https://twitter.com/PointerPodcast',
  linkedin: 'https://www.linkedin.com/company/pointerpodcast/',
} as const;

// Giscus configuration. Set these via environment variables (PUBLIC_*) or edit
// directly once you have created the GitHub Discussion category.
export const GISCUS = {
  repo: import.meta.env.PUBLIC_GISCUS_REPO || 'PointerSite/PointerSite',
  repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID || '',
  category: import.meta.env.PUBLIC_GISCUS_CATEGORY || 'Episodi',
  categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID || '',
  mapping: 'pathname',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  theme: 'preferred_color_scheme',
  lang: 'it',
  loading: 'lazy',
} as const;

export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Episodi', href: '/episodi/' },
  { label: 'Ospiti', href: '/ospiti/' },
  { label: 'Cerca', href: '/cerca/' },
] as const;

export const EPISODES_PER_PAGE = 12;
