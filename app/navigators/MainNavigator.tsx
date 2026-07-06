import { StyleSheet, View } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"

import { AIChatScreen } from "@/screens/AIChatScreen"
import { HistoryScreen } from "@/screens/HistoryScreen"
import { ProfileScreen } from "@/screens/ProfileScreen"
import { WorkoutScreen } from "@/screens/WorkoutScreen"
import { useAppTheme } from "@/theme/context"
import { ExercisesNavigator } from "./ExercisesNavigator"
import type { MainTabParamList } from "./navigationTypes"

const Tab = createBottomTabNavigator<MainTabParamList>()

const TabIcon = ({ focused, color, shape }: { focused: boolean; color: string; shape: "circle" | "square" | "triangle" | "dumbbell" | "brain" | "person" }) => {
  // ponytail: inline SVG-free icons via Unicode/emoji shapes since no icon lib installed
  const icons: Record<string, string> = {
    circle: "◉",
    square: "⊞",
    triangle: "▲",
    dumbbell: "⊗",
    brain: "◈",
    person: "◎",
  }
  return (
    <View style={[styles.iconWrap, focused && { opacity: 1 }]}>
      {/* render nothing — labels carry the navigation */}
    </View>
  )
}

export function MainNavigator() {
  const {
    theme: { colors, spacing },
  } = useAppTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: 4,
        },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "spaceGroteskMedium",
        },
      }}
    >
      <Tab.Screen
        name="Exercises"
        component={ExercisesNavigator}
        options={{ tabBarLabel: "Exercises", tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Log"
        component={WorkoutScreen}
        options={{ tabBarLabel: "Log", tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: "History", tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="AI"
        component={AIChatScreen}
        options={{ tabBarLabel: "AI Coach", tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile", tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iconWrap: { opacity: 0.5 },
})
