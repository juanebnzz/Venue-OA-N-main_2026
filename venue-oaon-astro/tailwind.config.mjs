/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        accent:         '#8B6448',
        'accent-deep':  '#6E4E38',
        'accent-pale':  '#EDE5DC',
        'accent-muted': '#B89882',
        linen:          '#F5F2EE',
        stone:          '#8C8578',
        'stone-text':   '#6B6560',
        charcoal:       '#1A1A1A',
        'charcoal-warm':'#1E1714',
        divider:        '#E0DDD8',
        white:          '#FFFFFF',
      },
      fontFamily: {
        heading: ['"Tenor Sans"', 'serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      maxWidth: {
        site: '1240px',
      },
      height: {
        nav: '64px',
      },
      transitionDuration: {
        fast: '200ms',
        base: '300ms',
        slow: '500ms',
      },
    },
  },
  plugins: [],
};
