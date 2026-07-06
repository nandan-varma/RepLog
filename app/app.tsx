if (__DEV__) {
  require("./devtools/ReactotronConfig.ts")
}
import "./utils/gestureHandler"

import { useEffect, useState } from "react"
import { useFonts } from "expo-font"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { AppNavigator } from "./navigators/AppNavigator"
import { useNavigationPersistence } from "./navigators/navigationUtilities"
import { ThemeProvider } from "./theme/context"
import { customFontsToLoad } from "./theme/typography"
import { loadDateFnsLocale } from "./utils/formatDate"
import * as storage from "./utils/storage"

export const NAVIGATION_PERSISTENCE_KEY = "NAVIGATION_STATE"

export function App() {
  const {
    initialNavigationState,
    onNavigationStateChange,
    isRestored: isNavigationStateRestored,
  } = useNavigationPersistence(storage, NAVIGATION_PERSISTENCE_KEY)

  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad)
  useEffect(() => {
    loadDateFnsLocale()
  }, [])

  if (!isNavigationStateRestored || (!areFontsLoaded && !fontLoadError)) {
    return null
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <KeyboardProvider>
        <ThemeProvider>
          <AppNavigator
            initialState={initialNavigationState}
            onStateChange={onNavigationStateChange}
          />
        </ThemeProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}
