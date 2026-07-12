import { PODCAST_HOST } from '../config';

export function getAudioUrl(podcast?: string, audioUrl?: string) {
  if (audioUrl) return audioUrl;
  if (!podcast) return undefined;
  const base = PODCAST_HOST.endsWith('/') ? PODCAST_HOST : `${PODCAST_HOST}/`;
  const file = podcast.startsWith('/') ? podcast.slice(1) : podcast;
  return `${base}${file}`;
}

export function getArtworkUrl(artwork?: string) {
  if (!artwork) return '/images/logo_puntata.png';
  return `/artworks/${artwork}`;
}

export function getGuestAvatarUrl(avatar?: string) {
  if (!avatar) return '/images/logo_puntata.png';
  return avatar.startsWith('/') ? avatar : `/guest_images/${avatar}`;
}

export function formatDuration(iso?: string) {
  return iso || '';
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatSeconds(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function parseTimestamp(hash?: string) {
  if (!hash) return undefined;
  const match = hash.match(/^t=(\d+(?:\.\d+)?)$/);
  return match ? parseFloat(match[1]) : undefined;
}
