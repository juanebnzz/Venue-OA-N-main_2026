import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://venueoaon.co.za',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      customPages: [
        'https://venueoaon.co.za/',
        'https://venueoaon.co.za/about/',
        'https://venueoaon.co.za/packages/',
        'https://venueoaon.co.za/gallery/',
        'https://venueoaon.co.za/contact/',
      ],
      filter: (page) =>
        !page.includes('privacy-policy') &&
        !page.includes('terms-of-service') &&
        !page.includes('404'),
      serialize(item) {
        const priorities = {
          'https://venueoaon.co.za/':           { priority: 1.0, changefreq: 'monthly' },
          'https://venueoaon.co.za/contact/':   { priority: 0.9, changefreq: 'monthly' },
          'https://venueoaon.co.za/packages/':  { priority: 0.8, changefreq: 'monthly' },
          'https://venueoaon.co.za/gallery/':   { priority: 0.7, changefreq: 'monthly' },
          'https://venueoaon.co.za/about/':     { priority: 0.6, changefreq: 'yearly'  },
        };
        const meta = priorities[item.url] ?? { priority: 0.5, changefreq: 'monthly' };
        return { ...item, ...meta };
      },
    }),
  ],
});
