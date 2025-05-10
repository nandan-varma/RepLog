/**
 * Theme color system
 * Defines all the colors used in the app with proper typing
 */
import { parseColor, parseThemeColors } from '@/utils/colorUtils';
import { Platform } from 'react-native';

export type ColorMode = 'light' | 'dark';

export interface ThemeColors {
    // Base colors
    background: string;
    foreground: string;

    // Card colors
    card: string;
    cardForeground: string;

    // Popover colors
    popover: string;
    popoverForeground: string;

    // Primary colors
    primary: string;
    primaryForeground: string;

    // Secondary colors
    secondary: string;
    secondaryForeground: string;

    // Muted colors
    muted: string;
    mutedForeground: string;

    // Accent colors
    accent: string;
    accentForeground: string;

    // Destructive colors
    destructive: string;

    // UI element colors
    border: string;
    input: string;
    ring: string;

    // Tab colors
    tabIconDefault: string;
    tabIconSelected: string;
    tint: string;

    // Text colors
    text: string;

    // Chart colors
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;

    // Sidebar colors
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
}

export interface Theme {
    radius: string;
    light: ThemeColors;
    dark: ThemeColors;
}

// Define the theme with all raw OKLCH colors
const rawTheme: Theme = {
    radius: '0.625rem',
    light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.147 0.004 49.25)',
        card: 'oklch(1 0 0)',
        cardForeground: 'oklch(0.147 0.004 49.25)',
        popover: 'oklch(1 0 0)',
        popoverForeground: 'oklch(0.147 0.004 49.25)',
        primary: 'oklch(0.216 0.006 56.043)',
        primaryForeground: 'oklch(0.985 0.001 106.423)',
        secondary: 'oklch(0.97 0.001 106.424)',
        secondaryForeground: 'oklch(0.216 0.006 56.043)',
        muted: 'oklch(0.97 0.001 106.424)',
        mutedForeground: 'oklch(0.553 0.013 58.071)',
        accent: 'oklch(0.97 0.001 106.424)',
        accentForeground: 'oklch(0.216 0.006 56.043)',
        destructive: 'oklch(0.577 0.245 27.325)',
        border: 'oklch(0.923 0.003 48.717)',
        input: 'oklch(0.923 0.003 48.717)',
        ring: 'oklch(0.709 0.01 56.259)',
        chart1: 'oklch(0.646 0.222 41.116)',
        chart2: 'oklch(0.6 0.118 184.704)',
        chart3: 'oklch(0.398 0.07 227.392)',
        chart4: 'oklch(0.828 0.189 84.429)',
        chart5: 'oklch(0.769 0.188 70.08)',
        sidebar: 'oklch(0.985 0.001 106.423)',
        sidebarForeground: 'oklch(0.147 0.004 49.25)',
        sidebarPrimary: 'oklch(0.216 0.006 56.043)',
        sidebarPrimaryForeground: 'oklch(0.985 0.001 106.423)',
        sidebarAccent: 'oklch(0.97 0.001 106.424)',
        sidebarAccentForeground: 'oklch(0.216 0.006 56.043)',
        sidebarBorder: 'oklch(0.923 0.003 48.717)',
        sidebarRing: 'oklch(0.709 0.01 56.259)',

        // Tab colors (legacy support)
        tabIconDefault: 'oklch(0.553 0.013 58.071)',
        tabIconSelected: 'oklch(0.216 0.006 56.043)',
        tint: 'oklch(0.216 0.006 56.043)',
        text: 'oklch(0.147 0.004 49.25)',
    },
    dark: {
        background: 'oklch(0.147 0.004 49.25)',
        foreground: 'oklch(0.985 0.001 106.423)',
        card: 'oklch(0.216 0.006 56.043)',
        cardForeground: 'oklch(0.985 0.001 106.423)',
        popover: 'oklch(0.216 0.006 56.043)',
        popoverForeground: 'oklch(0.985 0.001 106.423)',
        primary: 'oklch(0.923 0.003 48.717)',
        primaryForeground: 'oklch(0.216 0.006 56.043)',
        secondary: 'oklch(0.268 0.007 34.298)',
        secondaryForeground: 'oklch(0.985 0.001 106.423)',
        muted: 'oklch(0.268 0.007 34.298)',
        mutedForeground: 'oklch(0.709 0.01 56.259)',
        accent: 'oklch(0.268 0.007 34.298)',
        accentForeground: 'oklch(0.985 0.001 106.423)',
        destructive: 'oklch(0.704 0.191 22.216)',
        border: 'oklch(1 0 0 / 10%)',
        input: 'oklch(1 0 0 / 15%)',
        ring: 'oklch(0.553 0.013 58.071)',
        chart1: 'oklch(0.488 0.243 264.376)',
        chart2: 'oklch(0.696 0.17 162.48)',
        chart3: 'oklch(0.769 0.188 70.08)',
        chart4: 'oklch(0.627 0.265 303.9)',
        chart5: 'oklch(0.645 0.246 16.439)',
        sidebar: 'oklch(0.216 0.006 56.043)',
        sidebarForeground: 'oklch(0.985 0.001 106.423)',
        sidebarPrimary: 'oklch(0.488 0.243 264.376)',
        sidebarPrimaryForeground: 'oklch(0.985 0.001 106.423)',
        sidebarAccent: 'oklch(0.268 0.007 34.298)',
        sidebarAccentForeground: 'oklch(0.985 0.001 106.423)',
        sidebarBorder: 'oklch(1 0 0 / 10%)',
        sidebarRing: 'oklch(0.553 0.013 58.071)',

        // Tab colors (legacy support)
        tabIconDefault: 'oklch(0.709 0.01 56.259)',
        tabIconSelected: 'oklch(0.923 0.003 48.717)',
        tint: 'oklch(0.923 0.003 48.717)',
        text: 'oklch(0.985 0.001 106.423)',
    }
};

// Create a processed version that converts colors if needed for React Native
const theme: Theme = {
    radius: rawTheme.radius,
    light: Platform.OS === 'web' ? rawTheme.light : parseThemeColors(rawTheme.light),
    dark: Platform.OS === 'web' ? rawTheme.dark : parseThemeColors(rawTheme.dark)
};

export default theme;

/**
 * Helper functions to work with the theme
 */
export function getThemeColor(colorMode: ColorMode, colorKey: keyof ThemeColors): string {
    return theme[colorMode][colorKey];
}

/**
 * Convert oklch colors to CSS variables for web
 */
export function createCssVariables(): string {
    // Create CSS variables for the theme
    const lightVars = Object.entries(theme.light).map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        return `--${kebabKey}: ${value};`;
    }).join('\n  ');

    const darkVars = Object.entries(theme.dark).map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        return `--${kebabKey}: ${value};`;
    }).join('\n  ');

    return `:root {
  --radius: ${theme.radius};
  ${lightVars}
}

.dark {
  ${darkVars}
}`;
}
