import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider } from '@/components/ThemeProvider';

import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import theme from '@/constants/theme';

import * as schema from '@/db/schema';
import { db } from '@/db/db';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  console.log('Migration success:', success);

  const [loaded, FontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (FontError) throw FontError;
  }, [FontError]);

  useEffect(() => {
    if (success && loaded) {
      SplashScreen.hideAsync();
    }
  }, [success, loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { data } = useLiveQuery(db.select().from(schema.workouts));
  console.log('Data:', data);

  // Create custom theme based on our color scheme
  const CustomLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.light.primary,
      background: Colors.light.background,
      card: Colors.light.card,
      text: Colors.light.text,
      border: Colors.light.border,
    },
  };

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: Colors.dark.primary,
      background: Colors.dark.background,
      card: Colors.dark.card,
      text: Colors.dark.text,
      border: Colors.dark.border,
    },
  };

  return (
    <ThemeProvider>
      <NavigationThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background },
            animation: 'fade',
            animationDuration: 200,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              title: 'Log Workout',
              animation: 'slide_from_bottom',
              animationDuration: 250,
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
              }
            }} 
          />
        </Stack>
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}
