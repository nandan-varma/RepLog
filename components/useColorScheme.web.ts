// NOTE: The default React Native styling doesn't support server rendering.
// Server rendered styles should not change between the first render of the HTML
// and the first render on the client. Typically, web developers will use CSS media queries
// to render different styles on the client and server, these aren't directly supported in React Native
// but can be achieved using a styling library like Nativewind.
import { useEffect, useState } from 'react';

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if user prefers dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateColorScheme = () => {
      setColorScheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set initial value
    updateColorScheme();
    
    // Listen for changes
    mediaQuery.addEventListener('change', updateColorScheme);
    
    // Clean up event listener
    return () => {
      mediaQuery.removeEventListener('change', updateColorScheme);
    };
  }, []);

  return colorScheme;
}
