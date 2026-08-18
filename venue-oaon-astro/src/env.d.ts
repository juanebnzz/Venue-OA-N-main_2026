/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Web3Forms inbox key for the enquiry forms. Falls back to the production key in src/config.ts. */
  readonly PUBLIC_WEB3FORMS_KEY?: string;
  /** GA4 measurement ID, e.g. "G-XXXXXXXXXX". Unset ships no analytics at all. */
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  /** Google Search Console HTML-tag verification token. Unset omits the meta tag. */
  readonly PUBLIC_GSC_VERIFICATION?: string;
}
