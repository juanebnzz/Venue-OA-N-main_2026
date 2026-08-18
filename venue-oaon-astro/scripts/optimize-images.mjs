/**
 * Generates WebP derivatives for the gallery and the Open Graph share image.
 *
 * Photos live in `public/`, which Astro copies verbatim — its image pipeline
 * never sees them. This script fills that gap ahead of time so builds stay
 * fast: derivatives are committed alongside the originals and only rebuilt
 * when the source is newer.
 *
 *   npm run optimize:images
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root       = path.resolve(import.meta.dirname, '..');
const galleryDir = path.join(root, 'public/images/gallery');
const imagesDir  = path.join(root, 'public/images');

// Widths the gallery grid actually requests. 640 covers phones at 1x and the
// grid's ~320px columns at 2x; 1280 covers desktop columns and the lightbox.
const WIDTHS = [640, 1280];
const QUALITY = 78;

// The OG card is fixed at 1200x630 by the spec every social platform follows.
const OG_SOURCE = path.join(imagesDir, 'hero_bg_1.jpg');
const OG_OUTPUT = path.join(root, 'public/og-image.jpg');
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

const isSource = (f) => /\.(jpe?g|png)$/i.test(f);
const stale = (src, out) =>
  !fs.existsSync(out) || fs.statSync(src).mtimeMs > fs.statSync(out).mtimeMs;

const kb = (bytes) => `${Math.round(bytes / 1024)}KB`;

async function buildGallery() {
  if (!fs.existsSync(galleryDir)) {
    console.warn(`! No gallery directory at ${galleryDir} — skipping.`);
    return;
  }

  const all = fs.readdirSync(galleryDir).filter(isSource).sort();
  // Mirror the gallery's own rule: "IMG_5464 (1).jpg" is skipped when
  // "IMG_5464.jpg" exists, so it never needs derivatives either.
  const files = all.filter((f) => {
    const dupe = f.match(/^(.*) \(\d+\)(\.[^.]+)$/);
    return !dupe || !all.includes(dupe[1] + dupe[2]);
  });
  let written = 0, skipped = 0, sourceBytes = 0, derivedBytes = 0;

  for (const file of files) {
    const src = path.join(galleryDir, file);
    const base = file.replace(/\.[^.]+$/, '');
    sourceBytes += fs.statSync(src).size;

    // Never upscale: a 900px-wide original gets a 640 variant but not a 1280.
    const { width: srcWidth } = await sharp(src).metadata();

    for (const width of WIDTHS) {
      const out = path.join(galleryDir, `${base}-${width}.webp`);
      if (srcWidth && srcWidth < width && width !== WIDTHS[0]) continue;

      if (!stale(src, out)) {
        derivedBytes += fs.statSync(out).size;
        skipped++;
        continue;
      }

      await sharp(src)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);

      derivedBytes += fs.statSync(out).size;
      written++;
    }
  }

  console.log(`Gallery: ${files.length} photos — ${written} derivatives written, ${skipped} up to date.`);
  console.log(`  originals ${kb(sourceBytes)} · derivatives ${kb(derivedBytes)}`);
}

async function buildOgImage() {
  if (!fs.existsSync(OG_SOURCE)) {
    console.warn(`! No OG source at ${OG_SOURCE} — skipping.`);
    return;
  }
  if (!stale(OG_SOURCE, OG_OUTPUT)) {
    console.log(`OG image: up to date (${OG_WIDTH}x${OG_HEIGHT}).`);
    return;
  }

  await sharp(OG_SOURCE)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(OG_OUTPUT);

  console.log(`OG image: wrote og-image.jpg (${OG_WIDTH}x${OG_HEIGHT}, ${kb(fs.statSync(OG_OUTPUT).size)}).`);
}

await buildGallery();
await buildOgImage();
