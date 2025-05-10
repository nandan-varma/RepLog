import { Platform } from 'react-native';

/**
 * Convert OKLCH color strings to a format React Native can understand
 * For older versions of React Native, we need to convert OKLCH to regular RGB
 */
export function parseColor(colorString: string): string {
  // If we're on web, we can use OKLCH directly
  if (Platform.OS === 'web') {
    return colorString;
  }
  
  // For native platforms, we need to convert OKLCH to RGB or return a fallback
  // Simple fallbacks for commonly used colors in our theme
  if (colorString.startsWith('oklch')) {
    // Extract the values from the OKLCH string
    const match = colorString.match(/oklch\(([^)]+)\)/);
    if (match && match[1]) {
      const parts = match[1].split(' ');
      
      // Simplified mapping for common oklch colors to hex
      // These are approximate values - for production use, a proper color conversion library would be better
      if (colorString === 'oklch(1 0 0)') return '#ffffff'; // White
      if (colorString === 'oklch(0.147 0.004 49.25)') return '#111111'; // Near black
      if (colorString === 'oklch(0.216 0.006 56.043)') return '#222222'; // Dark gray
      if (colorString === 'oklch(0.985 0.001 106.423)') return '#f8f8f8'; // Near white
      if (colorString === 'oklch(0.923 0.003 48.717)') return '#dddddd'; // Light gray
      if (colorString === 'oklch(0.553 0.013 58.071)') return '#888888'; // Medium gray
      if (colorString === 'oklch(0.97 0.001 106.424)') return '#eeeeee'; // Very light gray
      if (colorString === 'oklch(0.577 0.245 27.325)') return '#d32f2f'; // Red/destructive
      
      // Add more mappings as needed
      
      // Default fallback for unknown OKLCH values
      return '#888888';
    }
    return '#888888';
  }
  
  // If it's not OKLCH, just return it as is (probably already a valid React Native color)
  return colorString;
}

/**
 * Wrap theme colors for React Native compatibility
 * @param themeColors The theme colors object
 * @returns A new object with all colors parsed to React Native compatible format
 */
export function parseThemeColors<T>(themeColors: T): T {
  const result = {} as T;
  
  for (const key in themeColors) {
    if (Object.prototype.hasOwnProperty.call(themeColors, key)) {
      // Type assertion to handle strings safely
      const colorValue = themeColors[key] as unknown as string;
      (result[key] as unknown) = parseColor(colorValue);
    }
  }
  
  return result;
}
