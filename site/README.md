# PointerPodcast — Astro

Questa è la nuova versione del sito di [PointerPodcast](https://pointerpodcast.it) costruita con **Astro**, **Pagefind**, **Giscus** e **Decap CMS**.

## TL;DR

```bash
cd site
npm install
npm run build          # genera il sito statico in dist/
npm run preview        # serve dist/ in locale
npm run dev            # server di sviluppo
npm run cms:dev        # backend locale per Decap CMS
```

## Stack e scelte

- **Astro 7** con `output: 'static'` — tutto il sito è statico, nessun server necessario per i visitatori.
- **Content Collections / Content Layer** — episodi e ospiti sono file Markdown in `src/content/`. Le trascrizioni sono file JSON in `src/content/transcripts/`.
- **Pagefind** — motore di ricerca full-text statico che indicizza l'HTML generato dopo la build (`astro-pagefind` lo esegue automaticamente).
- **Giscus** — commenti basati su GitHub Discussions, zero backend.
- **Decap CMS** — pannello di amministrazione git-based accessibile da `/admin/`. In locale può usare `decap-server` per scrivere direttamente sui file; in produzione committa su GitHub.

> **Perché Decap CMS invece di Keystatic?** Decap monta esattamente sulla route `/admin/` senza bisogno di route server-side e funziona con `output: 'static'`. Keystatic è più integrato con Astro ma richiede route API dinamiche e monta di default su `/keystatic`. Il tradeoff è che Decap ha bisogno di un flusso OAuth per autenticarsi con GitHub (o di Netlify Identity se deployi su Netlify).

## Struttura

```
site/
├── public/                     # asset statici copiati in dist/
│   ├── artworks/               # copertine episodi
│   ├── guest_images/           # avatar ospiti
│   └── images/                 # logo e icone
├── src/
│   ├── content/
│   │   ├── episodes/           # ~300 episodi in Markdown
│   │   ├── guests/             # ospiti in Markdown
│   │   └── transcripts/        # trascrizioni in JSON
│   ├── content.config.ts       # schema delle collections
│   ├── config.ts               # costanti del sito
│   ├── lib/utils.ts            # helper audio, copertine, date
│   ├── components/             # UI Astro (player, trascrizione, commenti...)
│   ├── layouts/Base.astro      # layout condiviso
│   └── pages/                  # route del sito
│       ├── index.astro
│       ├── episodi/
│       ├── ospiti/
│       ├── categorie/
│       ├── cerca.astro
│       └── admin/index.astro   # entry point Decap CMS
├── scripts/migrate.mjs         # migra contenuti dal vecchio sito Hugo
└── astro.config.mjs
```

## Come aggiungere un episodio (senza CMS)

1. Crea un file Markdown in `src/content/episodes/<slug>.md`.
2. Mantieni il frontmatter esistente e aggiungi i nuovi campi opzionali solo se servono:

```md
---
title: "Pointer[300]: Titolo"
description: "..."
date: 2026-07-12
categories:
  - Podcast
episode: 300
podcast: pointer300.mp3
type: episode
artwork: pp300.jpeg
duration: 00:45:00
guests: [slug-ospite]
transcript: ""
audioUrl: ""
---

## Note puntata

...
```

- `podcast` è solo il nome del file; l'URL completo viene composto con `PODCAST_HOST` in `src/config.ts`.
- `artwork` è il nome di un file in `public/artworks/`.
- `guests` è un array di slug che corrispondono a file in `src/content/guests/`.
- `transcript` e `audioUrl` sono opzionali; lasciali vuoti se non servono.

## Come aggiungere una trascrizione

1. Crea un file JSON in `src/content/transcripts/<id>.json`:

```json
{
  "episode": 300,
  "segments": [
    {
      "start": 0,
      "end": 12.5,
      "speaker": "Luca",
      "text": "Benvenuti al PointerPodcast..."
    }
  ]
}
```

2. Assicurati che `episode` corrisponda al campo `episode` dell'episodio. Il match avviene esplicitamente per numero di puntata.
3. Il testo della trascrizione viene renderizzato nella pagina episodio e quindi indicizzato da Pagefind.

## Come viene generato l'indice di ricerca

`astro-pagefind` è configurato come integrazione Astro. Dopo ogni `npm run build`, Pagefind:

1. legge l'HTML in `dist/`
2. indicizza titoli, descrizioni, note puntata, trascrizioni e pagine ospiti
3. scrive l'indice in `dist/pagefind/`

L'indice viene deployato insieme al sito, quindi la ricerca funziona senza backend. Nella pagina `/cerca/` è integrato il widget di Pagefind.

## Come avviare l'admin in locale

```bash
cd site
npm run cms:dev      # avvia decap-server su http://localhost:8081
npm run dev          # in un altro terminale, Astro su http://localhost:4321
```

Vai su http://localhost:4321/admin/. Decap rileverà `local_backend: true` e userà `decap-server` per leggere/scrivere i file localmente.

## Requisiti di hosting / deploy

Il sito è statico, quindi puoi deployarlo su **Netlify**, **Vercel**, **Cloudflare Pages** o qualsiasi hosting statico.

### Variabili d'ambiente

Tutte le variabili pubbliche devono iniziare con `PUBLIC_`:

| Variabile | Scopo | Default |
|-----------|-------|---------|
| `PUBLIC_SITE_URL` | URL canonico del sito | `https://pointerpodcast.it` |
| `PUBLIC_PODCAST_HOST` | Base URL dei file MP3 | configurato per R2 |
| `PUBLIC_GISCUS_REPO` | repo GitHub per i commenti | `PointerSite/PointerSite` |
| `PUBLIC_GISCUS_REPO_ID` | ID del repo Giscus | — |
| `PUBLIC_GISCUS_CATEGORY_ID` | ID della categoria Discussion | — |
| `PUBLIC_GITHUB_REPO` | repo per Decap CMS | `PointerSite/PointerSite` |
| `PUBLIC_OAUTH_BASE_URL` | base URL del proxy OAuth per Decap | — |

### Autenticazione per Decap CMS

- **Netlify**: la soluzione più semplice è abilitare **Netlify Identity** + **Git Gateway** e impostare `backend.name: 'git-gateway'` in `src/pages/admin/index.astro`.
- **Altri host (Vercel, Cloudflare Pages, self-hosted)**: usa il backend `github` già configurato e hosta un proxy OAuth, ad esempio [`decap-cms-oauth-provider`](https://github.com/ScientaNL/DoctrineJsonFunctions) o [`netlify-cms-oauth-provider`](https://github.com/vencax/netlify-cms-oauth-provider). Imposta `PUBLIC_OAUTH_BASE_URL` all'indirizzo del proxy.

Nessuna funzione serverless è richiesta per il sito pubblico; servono solo per il proxy OAuth se non usi Netlify Identity.

## Importare le trascrizioni

Le trascrizioni si trovano in `/Users/lucacorbucci/Documents/GitHub/PointerSet/transcriptions` e vengono importate con:

```bash
cd site
node scripts/import-transcripts.mjs
```

Lo script:

- legge ogni cartella numerata come numero di puntata
- converte i file `.txt` JSON in `src/content/transcripts/<episode>.json`
- normalizza eventuali timestamp `end` mancanti

I segmenti usano le etichette di speaker del tool di diarizzazione (es. `SPEAKER_00`, `SPEAKER_01`). Se in futuro vuoi mapparle sui nomi degli host/ospiti, puoi farlo modificando lo script o aggiungendo un campo `speaker_map` nel file della trascrizione.

## Migrazione dal vecchio sito Hugo

Lo script `scripts/migrate.mjs` legge `content/post/` e `content/page/guests/` dalla root del repository e scrive i file nelle nuove content collections, copiando anche le immagini in bundle.

```bash
cd site
node scripts/migrate.mjs
```

> Attenzione: lo script aggiunge automaticamente il campo `guests` agli episodi dove riesce a far corrispondere il numero di puntata con gli episodi elencati nelle vecchie pagine ospiti. È una conversione meccanica: controlla il risultato prima di committare.

## Note sui contenuti

- Il vecchio frontmatter viene riutilizzato quasi senza modifiche; sono stati aggiunti solo i campi opzionali `guests`, `transcript` e `audioUrl`.
- Alcuni vecchi episodi hanno `type: episode©` (typo di Hugo): lo script di migrazione lo normalizza a `episode`.
- Le durate in formato `H:MM:SS` senza zeri (es. `1:5:33`) vengono forzate a stringa per evitare che YAML le interpreti come numeri.
- Le immagini bundle (es. `stats_*.png`) vengono copiate accanto agli episodi per mantenere i riferimenti Markdown originali.
- Con tutte le trascrizioni importate il build impiega ~2 minuti e `dist/` pesa ~300 MB; l’indice Pagefind è ~18 MB. Se diventasse troppo pesante si può valutare di indicizzare solo le trascrizioni degli ultimi N episodi.

## Comandi utili

```bash
npm run dev         # server di sviluppo
npm run build       # build statico + Pagefind
npm run preview     # preview della build
npm run cms:dev     # backend Decap locale
npm run astro check # type-check Astro
```
