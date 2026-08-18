// Values shared by the enquiry forms (InquiryStrip + /contact).
//
// The Web3Forms access key is public by design: it ships in the rendered HTML of
// every page carrying a form, so there is nothing to hide here. Abuse protection
// comes from the domain allowlist on the Web3Forms dashboard and the `botcheck`
// honeypot field. Set PUBLIC_WEB3FORMS_KEY in the environment to override it
// (e.g. to point a preview deploy at a different inbox) without touching source.
export const WEB3FORMS_ACCESS_KEY =
  import.meta.env.PUBLIC_WEB3FORMS_KEY ?? "a99d482b-7729-4551-8bb6-08de2e564d4a";
