import type { Config } from 'tailwindcss';

/**
 * Every value here points at a custom property defined in src/design/tokens.css.
 * Nothing in this file is a literal colour. Components may only use these names —
 * `npm run lint:tokens` fails the build if a hex, rgb() or arbitrary colour value
 * shows up anywhere outside src/design/.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          text: 'var(--color-primary-text)',
          'text-hover': 'var(--color-primary-text-hover)',
        },
        brand: {
          DEFAULT: 'var(--color-brand)',
          hover: 'var(--color-brand-hover)',
        },
        canvas: 'var(--color-canvas)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
          tint: 'var(--color-surface-tint)',
          sunken: 'var(--color-surface-sunken)',
          'sunken-strong': 'var(--color-surface-sunken-strong)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          alt: 'var(--color-text-heading-alt)',
          body: 'var(--color-text-body)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          placeholder: 'var(--color-text-placeholder)',
          'on-primary': 'var(--color-text-on-primary)',
        },
        line: {
          DEFAULT: 'var(--color-border)',
          input: 'var(--color-border-input)',
          cool: 'var(--color-border-cool)',
          dashed: 'var(--color-border-dashed)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          surface: 'var(--color-success-surface)',
          border: 'var(--color-success-border)',
        },
        focus: 'var(--color-focus)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          text: 'var(--color-accent-text)',
        },
        rule: 'var(--color-rule)',
        'on-accent': {
          line: 'var(--color-on-accent-line)',
          faint: 'var(--color-on-accent-faint)',
          muted: 'var(--color-on-accent-muted)',
        },
        scrim: 'var(--color-scrim)',
        veil: 'var(--color-veil)',
      },
      backgroundImage: {
        cover: 'var(--gradient-cover)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
      fontSize: {
        hero: ['var(--text-hero)', { lineHeight: 'var(--leading-hero)' }],
        eyebrow: ['var(--text-eyebrow)', { lineHeight: '1.4' }],
        index: ['var(--text-index)', { lineHeight: '1.4' }],
        display: ['var(--text-display)', { lineHeight: 'var(--leading-title)' }],
        title: ['var(--text-title)', { lineHeight: 'var(--leading-title)' }],
        'title-sm': ['var(--text-title-sm)', { lineHeight: 'var(--leading-title)' }],
        initials: ['var(--text-initials)', { lineHeight: '1' }],
        'initials-sm': ['var(--text-initials-sm)', { lineHeight: '1' }],
        section: ['var(--text-section)', { lineHeight: 'var(--leading-tight)' }],
        'bar-title': ['var(--text-bar-title)', { lineHeight: 'var(--leading-tight)' }],
        body: ['var(--text-body)', { lineHeight: 'var(--leading-body)' }],
        meta: ['var(--text-meta)', { lineHeight: '1.4' }],
        button: ['var(--text-button)', { lineHeight: '1' }],
        chip: ['var(--text-chip)', { lineHeight: '1' }],
        'bar-sub': ['var(--text-bar-sub)', { lineHeight: '1.3' }],
        tab: ['var(--text-tab-mobile)', { lineHeight: '1.25rem' }],
      },
      letterSpacing: {
        base: 'var(--tracking-base)',
        heading: 'var(--tracking-heading)',
        display: 'var(--tracking-display)',
        initials: 'var(--tracking-initials)',
        eyebrow: 'var(--tracking-eyebrow)',
        index: 'var(--tracking-index)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        raised: 'var(--shadow-raised)',
        card: 'var(--shadow-card)',
        'avatar-sm': 'var(--shadow-avatar-sm)',
        avatar: 'var(--shadow-avatar)',
        modal: 'var(--shadow-modal)',
        sheet: 'var(--shadow-sheet)',
        bar: 'var(--shadow-bar)',
      },
      transitionTimingFunction: {
        default: 'var(--ease-default)',
        antd: 'var(--ease-antd)',
        out: 'var(--ease-out)',
        spring: 'var(--ease-spring)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
      borderWidth: {
        rule: 'var(--rule-weight)',
      },
      spacing: {
        gutter: 'var(--page-gutter)',
        'gutter-lg': 'var(--page-gutter-lg)',
        control: 'var(--control-height)',
        button: 'var(--button-height)',
        'button-sm': 'var(--button-height-sm)',
        tap: 'var(--tap-target)',
        'avatar-lg': 'var(--avatar-lg)',
        'avatar-md': 'var(--avatar-md)',
        cover: 'var(--cover-height)',
        'cover-sm': 'var(--cover-height-sm)',
      },
      zIndex: {
        sticky: 'var(--z-sticky)',
        header: 'var(--z-header)',
        actionbar: 'var(--z-actionbar)',
        'sheet-scrim': 'var(--z-sheet-scrim)',
        sheet: 'var(--z-sheet)',
        toast: 'var(--z-toast)',
        overlay: 'var(--z-overlay)',
      },
    },
  },
  plugins: [],
};

export default config;
