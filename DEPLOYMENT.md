# Deployment & operations

Everything needed to publish the site, and everything about it that lives
outside this repository.

> **Fill in the ⚠️ items.** They are the facts a new maintainer cannot recover
> from the code, and the ones that go missing when a site changes hands.

---

## Build

```bash
cd venue-oaon-astro
npm ci
npm run build          # -> venue-oaon-astro/dist/
```

| Setting | Value |
| --- | --- |
| Root directory | `venue-oaon-astro` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 18+ (developed on Node 24) |

The output is fully static — no server runtime, database or CMS. Any static
host will serve it.

### Images are not built on deploy

Gallery derivatives and the Open Graph card are generated **ahead of time** and
committed, so deploys stay fast:

```bash
npm run optimize:images
```

Run this after adding photos to `public/images/gallery/`, then commit the new
`*-640.webp` / `*-1280.webp` files alongside the originals. The script is
incremental — it only rewrites a derivative when its source is newer — so
re-running it is cheap and safe. See the Gallery section of the README.

---

## Hosting

⚠️ **Unconfirmed — the repo contradicts itself.** `.gitignore` has a `.vercel/`
entry, while the Privacy Policy (sections on data sharing and security) names
**Netlify** as the host that processes form submissions. At most one is true.

Resolve this before launch and record it here, because the Privacy Policy makes
a legal representation about who processes visitor data:

- [ ] Actual host: ⚠️ _________________
- [ ] Account / team the project sits under: ⚠️ _________________
- [ ] Who has deploy access: ⚠️ _________________
- [ ] Update the host named in `src/pages/privacy-policy.astro` to match

> Note: form submissions actually go to **Web3Forms**, not to the host — the
> forms POST directly to `api.web3forms.com` from the browser. Whichever host is
> named, the policy's description of form handling should reflect that.

---

## Domain & DNS

- **Production domain:** `venueoaon.co.za`
- ⚠️ **Registrar:** _________________
- ⚠️ **DNS managed at:** _________________
- ⚠️ **Mail host for `info@venueoaon.co.za`:** _________________

### Changing the domain

Three places hard-code it and must change together:

1. `site` in `venue-oaon-astro/astro.config.mjs` — also drives the sitemap's
   `customPages` list and its per-page priority map
2. The `Sitemap:` line in `venue-oaon-astro/public/robots.txt`
3. Canonical/structured-data fallbacks in the pages (`https://venueoaon.co.za`
   appears as the fallback wherever `Astro.site` is read)

---

## Environment variables

All are optional; see `venue-oaon-astro/.env.example`. Every one is `PUBLIC_`,
meaning the value is rendered into the page HTML — **none of these are secrets.**

| Variable | Effect when unset |
| --- | --- |
| `PUBLIC_WEB3FORMS_KEY` | Falls back to the production inbox key in `src/config.ts` |
| `PUBLIC_GA_MEASUREMENT_ID` | No analytics ship at all (see below) |
| `PUBLIC_GSC_VERIFICATION` | No Search Console meta tag is emitted |

Set them in the host's dashboard for production, or in a local `.env` for
development. `.env` is gitignored.

---

## Enquiry forms

Both the homepage `InquiryStrip` and the `/contact` form POST to
[Web3Forms](https://web3forms.com). The access key is public by design and lives
in `venue-oaon-astro/src/config.ts`.

- ⚠️ **Web3Forms account owner (where enquiries land):** _________________
- ⚠️ **Inbox address submissions forward to:** _________________

This is the single most important unknown in the project: if nobody knows who
owns that inbox, enquiries can be silently lost. Verify by submitting a test
enquiry and confirming it arrives.

Abuse protection is the domain allowlist on the Web3Forms dashboard plus the
`botcheck` honeypot field — **confirm the allowlist includes the production
domain**, or submissions will be rejected in production while working locally.

---

## Analytics (Google Analytics 4)

The site ships **no analytics** unless `PUBLIC_GA_MEASUREMENT_ID` is set. This is
deliberate and wired so the legal copy can never drift out of step with reality:

| `PUBLIC_GA_MEASUREMENT_ID` | What ships |
| --- | --- |
| unset | No gtag script, no cookies. Privacy Policy omits the Google Analytics section and its Cookies section states the site sets no analytics cookies. Cookie banner mentions Google Fonts only. |
| set to `G-XXXXXXXXXX` | GA4 loads with `anonymize_ip`. Privacy Policy gains the Google Analytics section (renumbering the rest automatically) and switches the Cookies wording. Cookie banner mentions analytics. |

**To enable:** create a GA4 property, copy the measurement ID, set the variable in
the host's environment, redeploy, then confirm hits arrive in GA4 Realtime.

Because enabling GA sets cookies for South African visitors, POPIA makes the
policy wording a legal requirement, not a nicety — which is why it is automatic
rather than a manual checklist item.

---

## Google Search Console

Not yet verified. ⚠️ Confirm whether a property already exists before creating
one — verification is often done by DNS TXT record, which leaves no trace in this
repo.

Two supported routes:

1. **DNS TXT record** (recommended for a domain property — covers every
   subdomain and survives host changes). Nothing to change in this repo.
2. **HTML tag** — set `PUBLIC_GSC_VERIFICATION` to the token from the `content`
   attribute Google shows you, and redeploy. `BaseLayout.astro` emits the meta
   tag on every page.

Once verified, submit the sitemap: `https://venueoaon.co.za/sitemap-index.xml`.

Note that `/privacy-policy` and `/terms-of-service` are intentionally excluded
from the sitemap and disallowed in `robots.txt`, and carry `noindex`. Expect
Search Console to report them as excluded — that is correct, not a fault.

---

## Pre-launch checklist

- [ ] Resolve the Netlify/Vercel contradiction and correct the Privacy Policy
- [ ] Confirm a test enquiry reaches the real inbox
- [ ] Confirm the Web3Forms domain allowlist includes `venueoaon.co.za`
- [ ] Verify the domain in Search Console and submit the sitemap
- [ ] Decide on analytics, and set `PUBLIC_GA_MEASUREMENT_ID` if yes
- [ ] Run `npm run optimize:images` and commit any missing derivatives
- [ ] Check social previews with the [Facebook debugger](https://developers.facebook.com/tools/debug/)
      and [X card validator](https://cards-dev.twitter.com/validator)
- [ ] Confirm HTTPS and the apex/`www` redirect both resolve
- [ ] Fill in every ⚠️ above
