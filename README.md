# Venue Oaón

Marketing and enquiry website for **Venue Oaón**, an intimate event space in Montana, Pretoria (South Africa) hosting baby showers, kitchen teas, bridal showers and birthdays for gatherings of roughly 20–50 guests.

Live site: <https://venueoaon.co.za>

Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com), output as a fully static site — there is no server runtime, database or CMS.

---

## Quick start

Requires Node.js 18+ (developed on Node 24) and npm.

```bash
cd venue-oaon-astro
npm install
npm run dev        # http://localhost:4321
```

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Astro dev server with HMR |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run optimize:images` | Regenerate gallery WebP derivatives and the Open Graph card |

The Astro project lives in the `venue-oaon-astro/` subdirectory — all commands must be run from there.

---

## Project structure

```
venue-oaon-astro/
├── astro.config.mjs          # Site URL, Tailwind + sitemap integrations
├── tailwind.config.mjs       # Brand colours, fonts, radii, max-widths
├── .env.example              # Every supported environment variable, all optional
├── scripts/
│   └── optimize-images.mjs   # Gallery WebP derivatives + the OG card (run manually)
├── public/
│   ├── images/               # Hero, suite and founder photography
│   │   └── gallery/          # ~100 photos + committed .webp derivatives
│   ├── og-image.jpg          # 1200×630 social share card (generated)
│   ├── robots.txt
│   └── site.webmanifest
└── src/
    ├── config.ts             # Web3Forms access key (public by design)
    ├── components/
    │   ├── layout/           # BaseLayout, Nav, Footer, WhatsAppButton, CookieNotice
    │   ├── sections/         # Hero, TheSpace, SuitesGrid, PackagesGrid,
    │   │                     #   PracticalDetails, StatsStrip, InquiryStrip, PageHero
    │   └── ui/               # Button, Badge, Wrap, PackageCard, SuiteCard
    ├── content/
    │   ├── suites.json       # The three suites: capacity, time slots, imagery
    │   └── packages.json     # Décor packages 1–4 and their inclusions
    ├── pages/                # One file per route (file-based routing)
    └── styles/
        ├── tokens.css        # CSS custom properties: fluid type, spacing, palette
        ├── global.css        # Base element and utility styles
        └── animations.css    # Reveal / transition keyframes
```

### Routes

| Route | Page |
| --- | --- |
| `/` | Home — hero, the space, suites, packages, practical details, enquiry strip |
| `/about` | The venue's story and founder |
| `/packages` | Décor packages 1–4 with full inclusion lists |
| `/gallery` | Filterable photo gallery generated from `public/images/gallery/` |
| `/contact` | Enquiry form, contact details, map, FAQ accordion |
| `/privacy-policy`, `/terms-of-service` | Legal pages (excluded from sitemap and `robots.txt`) |
| `/404` | Not-found page |

---

## How things work

### Content

Suites and packages are plain JSON in `src/content/`. To change capacities, time slots, package inclusions or which package is featured, edit `suites.json` / `packages.json` — no component changes needed. `featured: true` on a package renders it as the highlighted tier.

### Gallery

`src/pages/gallery.astro` reads `public/images/gallery/` directly from the filesystem **at build time**. It:

- filters to `.jpg` / `.png` and drops duplicate `name (1).jpg` copies when the original exists,
- parses real pixel dimensions out of each JPEG/PNG header so the grid reserves correct space (no layout shift as lazy images load),
- applies optional per-file metadata (suite, label, aspect ratio) from the `manualMetadata` map in that file.

Dropping new photos into `public/images/gallery/` and rebuilding is enough to publish them; add an entry to `manualMetadata` only if a specific image needs a custom label or suite tag.

#### Image optimisation

Photos live in `public/`, which Astro copies verbatim — its image pipeline never sees them. `npm run optimize:images` fills that gap, writing WebP derivatives next to each original:

```
IMG_5139.jpg          original, kept as the <img> fallback
IMG_5139-640.webp     phones, and the ~400px desktop column at 2x
IMG_5139-1280.webp    large columns and the lightbox (only if the source is that wide)
```

The gallery emits a `<picture>` whose `srcset` lists whichever derivatives actually exist, so a photo with no variants still renders from its original. The lightbox opens the widest available WebP via `data-full`.

Derivatives are **committed**, not built on deploy — that keeps builds fast and avoids reprocessing 100+ photos on every push. The script is incremental (it rewrites a derivative only when the source is newer) and skips the same duplicate `name (1).jpg` copies the gallery itself drops, so re-running it is cheap. **After adding photos, run it and commit the new `.webp` files.**

The same script crops `og-image.jpg` to the 1200×630 that social platforms expect.

### Enquiry forms

Both the homepage `InquiryStrip` and the full form on `/contact` submit via `fetch` to [Web3Forms](https://web3forms.com) (`https://api.web3forms.com/submit`). Each form carries:

- a hidden `access_key` identifying the Web3Forms inbox, sourced from `WEB3FORMS_ACCESS_KEY` in `src/config.ts`,
- a hidden `subject` line,
- a hidden `botcheck` honeypot field.

Submission is intercepted client-side: constraint validation runs manually (the forms use `novalidate`), the request is aborted after a 15-second timeout, and success/error panels are toggled in place. The access key is public by design (it is rendered into the page HTML), so it lives in `src/config.ts` rather than a secret store; abuse protection comes from the domain allowlist on the Web3Forms dashboard plus the honeypot. Rotating it means editing that one constant, or setting `PUBLIC_WEB3FORMS_KEY` in the environment to override it (see `.env.example`).

A floating WhatsApp button (`WhatsAppButton.astro`) opens a modal that deep-links to `wa.me` with a prefilled message.

### Styling

Two layers work together:

- **Tailwind** for utility classes, configured with the brand palette (`accent`, `linen`, `stone`, `charcoal`, …), the `Tenor Sans` / `Inter` font pairing and a `1240px` site max-width. Tailwind's base styles are disabled (`applyBaseStyles: false`).
- **CSS custom properties** in `tokens.css` for what Tailwind can't express natively: fluid `clamp()` type scale, fluid gutters, responsive nav height and custom easing curves.

Fonts are loaded non-blocking from Google Fonts via a `media="print"` / `onload` swap with a `<noscript>` fallback.

### SEO

`BaseLayout.astro` centralises the head: canonical URLs, Open Graph and Twitter cards, `en-ZA` hreflang, geo meta tags for local search, PWA manifest and favicons. Pages pass structured data through the `head` slot as JSON-LD — `LocalBusiness`/`EventVenue` on the home page, `ContactPage` plus a full `FAQPage` on contact.

`@astrojs/sitemap` generates `sitemap-index.xml` with per-page priorities and change frequencies set in `astro.config.mjs`; legal pages and `404` are filtered out there and disallowed in `robots.txt`.

### Analytics

**The site ships no analytics by default** — no Google Analytics, no tag manager, no tracking pixel, and no cookies beyond what Google Fonts requires.

Analytics is opt-in through a single environment variable, `PUBLIC_GA_MEASUREMENT_ID`. Because enabling tracking for South African visitors makes the policy wording a POPIA obligation rather than a nicety, the legal copy is wired to the same flag so the two can never drift apart:

| `PUBLIC_GA_MEASUREMENT_ID` | What ships |
| --- | --- |
| unset | No gtag script. Privacy Policy omits the Google Analytics section and states that no analytics cookies are set. Cookie banner mentions Google Fonts only. |
| `G-XXXXXXXXXX` | GA4 loads from `BaseLayout.astro` with `anonymize_ip`. Privacy Policy gains the Google Analytics section, the sections below it renumber themselves, and the Cookies wording switches. Cookie banner mentions analytics. |

So enabling analytics is one variable plus a redeploy — there is no manual policy edit to forget. Bump `effectiveDate` in `src/pages/privacy-policy.astro` when you do, since the published terms will have changed.

**Google Search Console** verification works the same way: set `PUBLIC_GSC_VERIFICATION` to the token from Google's "HTML tag" method and `BaseLayout.astro` emits the meta tag site-wide. If the domain was verified by DNS TXT record instead, leave it unset — that method needs nothing in this repo.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full setup steps.

---

## Deployment

`npm run build` emits a static `dist/` directory that can be served by any static host. Three values are hard-coded to the production domain and must be updated together if it changes:

- `site` in `astro.config.mjs` (also drives the sitemap's `customPages` and priority map),
- the `Sitemap:` line in `public/robots.txt`,
- the canonical and structured-data fallbacks in the pages, which reference `https://venueoaon.co.za` wherever `Astro.site` is read.

**[DEPLOYMENT.md](DEPLOYMENT.md) is the operational runbook** — host settings, domain and DNS, environment variables, where enquiries are delivered, analytics and Search Console setup, and a pre-launch checklist. It also tracks the facts that live outside this repo and would otherwise be lost at handover; several are still marked ⚠️ and need filling in.

> One is worth resolving early: the Privacy Policy names **Netlify** as the host while `.gitignore` anticipates **Vercel**. At most one is true, and the policy makes a legal representation about who processes visitor data.

---

## Venue reference

Details encoded across the site, useful when updating copy:

- **Address:** 978 Veda Ave, Montana AH, Pretoria, 0186
- **Contact:** info@venueoaon.co.za · +27 76 182 3532
- **Suites:** Myrrh (indoor, 30–40), Olive (in/out, 20–30), Garden (outdoor, 30–40); Myrrh + Garden combine for up to 50
- **Time slots:** morning 08:00–12:00, afternoon 13:00–17:00, evening 18:00–22:00; Sunday closes 15:00
- **Pricing:** not published — quotes are issued per enquiry, secured by a 50% deposit

---

## Licence

Proprietary — copyright © 2026 Venue Oaón, all rights reserved. The venue
photography under `public/images/` is commissioned work and is expressly
excluded from reuse. See [LICENSE](LICENSE).
