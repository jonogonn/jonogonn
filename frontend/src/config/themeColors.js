/**
 * Centralized Theme & Branding Colors Configuration for Jonogon News.
 * Strictly solid colors only - NO GRADIENTS.
 * Each color token includes comments detailing where it is displayed across the platform.
 */

export const themeColors = {
  // Brand Primary & Accents
  primaryRed: '#E60012', // Main brand identity, top navigation accent, breaking news badges, primary CTA buttons
  darkRed: '#A8000D', // Hover states for primary red buttons, category header underlines, active tab indicators
  white: '#FFFFFF', // Page background in light mode, text on dark/red surfaces, card container backgrounds
  black: '#111111', // Primary text headings in light mode, dark mode body backgrounds, footer base
  silver: '#D9D9D9', // Card dividing lines, border accents, input field outlines

  // Neutral Scales (Light Mode)
  gray100: '#F8F9FA', // Subtle section backgrounds, search filter sidebars, disabled input fields
  gray200: '#E9ECEF', // Neutral card borders, tab pills inactive state, table headers
  gray300: '#DEE2E6', // Form borders, dividing horizontal rules, input borders
  gray600: '#6C757D', // Subtitles, metadata dates, reporter bylines, search result counts
  gray800: '#343A40', // High-contrast subheadings, dark mode card surfaces, footer link labels

  // Functional Semantic Colors
  success: '#16A34A', // Success badges, verified checkmarks, saved notification messages
  warning: '#D97706', // Warning alert banners, pending review post indicators
  error: '#DC2626', // Form error text, delete buttons, rejected post indicators
  info: '#2563EB', // Info badges, verified reporter tags, external links

  // Light Mode Surfaces & Text
  light: {
    bgBody: '#FFFFFF', // Main public webpage background
    bgSurface: '#FFFFFF', // News card surfaces and search modal backgrounds
    bgSubtle: '#F8F9FA', // Filter box panel background and secondary content blocks
    bgCard: '#FFFFFF', // Article card container background
    textMain: '#111111', // Primary article headlines and readable text
    textMuted: '#555555', // Publication timestamps, author byline, and article excerpts
    borderColor: '#E2E8F0', // Border divider for article cards and search inputs
  },

  // Dark Mode Surfaces & Text
  dark: {
    bgBody: '#0D1117', // Main public webpage dark background
    bgSurface: '#161B22', // News cards and filter panel dark background
    bgSubtle: '#21262D', // Subtle dark card background and hover states
    bgCard: '#161B22', // Article card dark container background
    textMain: '#F0F6FC', // High-contrast readable white/off-white headline text
    textMuted: '#8B949E', // Subdued timestamps and excerpts in dark mode
    borderColor: '#30363D', // Dark mode card borders and divider lines
  }
};

export default themeColors;

