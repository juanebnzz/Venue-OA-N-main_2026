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

The Astro project lives in the `venue-oaon-astro/` subdirectory — all commands must be run from there.

---

## Project structure

```
venue-oaon-astro/
├── astro.config.mjs          # Site URL, Tailwind + sitemap integrations
├── tailwind.config.mjs       # Brand colours, fonts, radii, max-widths
├── public/
│   ├── images/               # Hero, suite and founder photography
│   │   └── gallery/          # ~100 gallery photos (read at build time)
│   ├── robots.txt
│   └── site.webmanifest
└── src/
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

**The site runs no analytics.** There is no Google Analytics, no tag manager and no tracking pixel in the codebase, and the Privacy Policy no longer describes any. The `CookieNotice` banner covers Google Fonts only.

If the client asks for analytics later, whoever takes over the site must do both halves of the job:

1. **Install the provider** — add the tag/script (e.g. via `BaseLayout.astro`, which owns the `<head>`), and confirm it fires in production.
2. **Restore the matching policy language** in `src/pages/privacy-policy.astro` — a section describing the provider, what it collects and how to opt out, plus a corresponding update to the **Cookies** section, which currently states that the site sets no analytics cookies. Sections are numbered sequentially, so inserting one means renumbering those below it. Bump `effectiveDate` at the top of the file, and revisit the `CookieNotice` wording if the provider sets cookies.

Shipping analytics without the policy update would leave the published policy inaccurate under POPIA.

---

## Deployment

`npm run build` emits a static `dist/` directory that can be served by any static host (the `.gitignore` anticipates Vercel). Two values are hard-coded to the production domain and must be updated together if it changes:

- `site` in `astro.config.mjs` (also drives the sitemap's `customPages` and priority map),
- the `Sitemap:` line in `public/robots.txt`.

Structured data and canonical fallbacks in the pages also reference `https://venueoaon.co.za`.

---

## Venue reference

Details encoded across the site, useful when updating copy:

- **Address:** 978 Veda Ave, Montana AH, Pretoria, 0186
- **Contact:** info@venueoaon.co.za · +27 76 182 3532
- **Suites:** Myrrh (indoor, 30–40), Olive (in/out, 20–30), Garden (outdoor, 30–40); Myrrh + Garden combine for up to 50
- **Time slots:** morning 08:00–12:00, afternoon 13:00–17:00, evening 18:00–22:00; Sunday closes 15:00
- **Pricing:** not published — quotes are issued per enquiry, secured by a 50% deposit
