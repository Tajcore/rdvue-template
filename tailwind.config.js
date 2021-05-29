module.exports = {
  important: true,
  purge: {
    content: ['./src/**/*.html', './src/**/*.vue', './src/**/*.jsx'],
    // These options are passed through directly to PurgeCSS
    options: {
      whitelist: [],
    },
  },
  theme: {
    /**
     * Color values are defined in /src/theme/colors.scss.
     * Color names should be sematic in order to provide
     * contextual alignment when thinking about themes.
     * E.g. primary-text-color (semantic) vs black-1 (literal)
     */
    colors: {
      inherit: 'inherit',
      transparent: 'transparent',
      typography: {
        primary: 'var(--typography-primary)',
        secondary: 'var(--typography-secondary)',
        error: 'var(--typography-error)',
        light: 'var(--typography-light)',
      },
      button: {
        'success': 'var(--button-success)',
        'failure': 'var(--button-failure)',
      },
    },
  },
  variants: {},
  plugins: [],
};