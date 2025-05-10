import { useColorScheme } from '@/components/useColorScheme';
import theme, { ColorMode, ThemeColors } from '@/constants/theme';

/**
 * Hook to get all theme colors for the current color scheme
 * @returns The current theme colors based on the active color scheme
 */
export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme() ?? 'light';
  return theme[colorScheme];
}

/**
 * Hook to get a specific theme color for the current color scheme
 * @param colorName The name of the color to get
 * @returns The color value for the current theme
 */
export function useThemeColor(colorName: keyof ThemeColors): string {
  const colors = useThemeColors();
  return colors[colorName];
}

/**
 * Helper function to get a theme color with a specific mode
 * @param mode The color mode ('light' or 'dark')
 * @param colorName The name of the color to get
 * @returns The color value for the specified theme
 */
export function getThemeColor(mode: ColorMode, colorName: keyof ThemeColors): string {
  return theme[mode][colorName];
}

/**
 * Helper function to get the appropriate color based on dark mode
 * @param lightModeColor The color to use in light mode
 * @param darkModeColor The color to use in dark mode
 * @returns The appropriate color for the current theme
 */
export function useDynamicColor(lightModeColor: string, darkModeColor: string): string {
  const colorScheme = useColorScheme() ?? 'light';
  return colorScheme === 'dark' ? darkModeColor : lightModeColor;
}
