import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import theme, { ColorMode, ThemeColors } from '@/constants/theme';

// Create the theme context
interface ThemeContextType {
  currentTheme: ColorMode;
  themeColors: ThemeColors;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: 'light',
  themeColors: theme.light,
  toggleTheme: () => {},
  isDarkMode: false,
});

// Hook to use the theme
export const useTheme = () => useContext(ThemeContext);

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get the device color scheme
  const deviceColorScheme = useColorScheme() as ColorMode || 'light';
  const [currentTheme, setCurrentTheme] = useState<ColorMode>(deviceColorScheme);

  // Update theme when device theme changes
  useEffect(() => {
    setCurrentTheme(deviceColorScheme);
  }, [deviceColorScheme]);

  // Get the current theme colors
  const themeColors = theme[currentTheme];
  const isDarkMode = currentTheme === 'dark';

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeColors, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Helper function to get a theme color with the current theme mode
 * @param colorKey Key of the color in the theme
 * @returns The color value for the current theme
 */
export function useThemeColor(colorKey: keyof ThemeColors): string {
  const { themeColors } = useTheme();
  return themeColors[colorKey];
}
