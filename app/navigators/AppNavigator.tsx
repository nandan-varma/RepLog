import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import Config from "@/config"
import { ErrorBoundary } from "@/screens/ErrorScreen/ErrorBoundary"
import { OnboardingScreen } from "@/screens/OnboardingScreen"
import { isOnboarded } from "@/services/profileService"
import { useAppTheme } from "@/theme/context"

import { MainNavigator } from "./MainNavigator"
import { navigationRef, useBackButtonHandler } from "./navigationUtilities"
import type { AppStackParamList, NavigationProps } from "./navigationTypes"

const exitRoutes = Config.exitRoutes
const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName={isOnboarded() ? "Main" : "Onboarding"}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  )
}

export const AppNavigator = (props: NavigationProps) => {
  const { navigationTheme } = useAppTheme()
  useBackButtonHandler((routeName) => exitRoutes.includes(routeName))

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <AppStack />
      </ErrorBoundary>
    </NavigationContainer>
  )
}
