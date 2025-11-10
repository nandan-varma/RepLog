// --- Expo and React Native Core ---
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import 'react-native-reanimated';

// --- UI Components and Icons ---
import "@/assets/styles/global.css";
import { View } from 'react-native';
import { PortalHost } from '@rn-primitives/portal';
import { Text } from '@/components/ui/text';

import { TransitionProvider } from '@/components/TransitionContext';
import { OnboardingProvider } from '@/components/OnboardingContext';


// --- Database and Data Management ---
import { db } from '@/db/db';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { initializationService } from '@/services/initializationService';

// --- Theming and Styling ---
import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { NAV_THEME } from '~/lib/theme';
import { useColorScheme } from '~/lib/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};

const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

// Conditionally use different layout effects based on platform
const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // --- UI State ---
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [migrationCompleted, setMigrationCompleted] = React.useState(false);

  // --- Database Migrations ---
  const { success, error } = useMigrations(db, migrations);
  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  React.useEffect(() => {
    if (success && !migrationCompleted) {
      setMigrationCompleted(true);
    }
  }, [success, migrationCompleted]);

  // --- Font Loading ---
  const [loaded, FontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // --- Platform-specific Setup ---
  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  // --- Error Handling ---
  useEffect(() => {
    if (FontError) throw FontError;
  }, [FontError]);

  // --- Splash Screen Management & App Initialization ---
  useEffect(() => {
    const initializeApp = async () => {
      if (loaded && migrationCompleted) {
        // Initialize application data
        await initializationService.initialize();

        // Then hide splash screen
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, [loaded, migrationCompleted]);

  // --- Loading States ---
  if (!isColorSchemeLoaded || !loaded) {
    return null;
  }

  return (
    <OnboardingProvider>
      <RootLayoutNav />
    </OnboardingProvider>
  );
}

function RootLayoutNav() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
      <TransitionProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationTypeForReplace: 'push',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </TransitionProvider>
      <PortalHost />
    </ThemeProvider>
  );
}
