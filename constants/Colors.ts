/**
 * Colors.ts - Legacy color system adapter
 * This file imports from theme.ts and maintains backwards compatibility
 * with existing components that use the Colors object.
 */
import theme, { ColorMode, ThemeColors } from './theme';

// Export theme as default for backward compatibility
export default {
  light: theme.light,
  dark: theme.dark
};

// Export theme types for better TypeScript support
export type { ColorMode, ThemeColors };

// Re-export theme for direct access
export { getThemeColor } from './theme';
