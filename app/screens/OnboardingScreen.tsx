import { useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { saveProfile, type FitnessGoal, type WeightUnit } from "@/services/profileService"
import { useAppTheme } from "@/theme/context"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"

const { width } = Dimensions.get("window")

const GOALS: { key: FitnessGoal; label: string; emoji: string }[] = [
  { key: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { key: "lose_weight", label: "Lose Weight", emoji: "🔥" },
  { key: "improve_endurance", label: "Endurance", emoji: "🏃" },
  { key: "stay_active", label: "Stay Active", emoji: "✨" },
]

export function OnboardingScreen({ navigation }: AppStackScreenProps<"Onboarding">) {
  const { theme: { colors, spacing } } = useAppTheme()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [goal, setGoal] = useState<FitnessGoal>("build_muscle")
  const [unit, setUnit] = useState<WeightUnit>("kg")
  const slideAnim = useRef(new Animated.Value(0)).current

  const goNext = () => {
    Animated.timing(slideAnim, {
      toValue: -(step + 1) * width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setStep((s) => s + 1))
  }

  const finish = () => {
    saveProfile({ name: name.trim() || "Athlete", fitnessGoal: goal, bookmarks: [], apiKey: "", weightUnit: unit })
    // ponytail: cast needed because MainTabParamList has no required params
    ;(navigation as any).replace("Main")
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    slides: { flexDirection: "row", width: width * 3 },
    slide: { width, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxl },
    indicator: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: spacing.xl },
    dot: { width: 8, height: 8, borderRadius: 4 },
    title: { fontSize: 32, fontFamily: "spaceGroteskBold", color: colors.text, marginBottom: spacing.xs },
    subtitle: { fontSize: 16, color: colors.textDim, marginBottom: spacing.xxl },
    input: {
      borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      fontSize: 18, fontFamily: "spaceGroteskRegular", color: colors.text,
    },
    goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    goalCard: {
      width: (width - spacing.xl * 2 - spacing.sm) / 2 - 1,
      borderWidth: 1.5, borderRadius: 16, padding: spacing.md,
      alignItems: "center", gap: spacing.xs,
    },
    goalEmoji: { fontSize: 28 },
    goalLabel: { fontSize: 14, fontFamily: "spaceGroteskMedium", textAlign: "center" },
    unitRow: { flexDirection: "row", gap: spacing.sm },
    unitBtn: {
      flex: 1, paddingVertical: spacing.md, borderRadius: 12,
      borderWidth: 1.5, alignItems: "center",
    },
    unitLabel: { fontSize: 20, fontFamily: "spaceGroteskBold" },
    spacer: { flex: 1 },
    btn: {
      backgroundColor: colors.tint, borderRadius: 14,
      paddingVertical: spacing.md, alignItems: "center",
    },
    btnText: { color: "#fff", fontSize: 17, fontFamily: "spaceGroteskBold" },
    btnDisabled: { opacity: 0.4 },
  })

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} style={s.container}>
      {/* Step indicators */}
      <View style={s.indicator}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[s.dot, { backgroundColor: i <= step ? colors.tint : colors.separator }]}
          />
        ))}
      </View>

      <Animated.View style={[s.slides, { transform: [{ translateX: slideAnim }] }]}>
        {/* Step 0: Name */}
        <View style={s.slide}>
          <Text text="What's your name?" style={s.title} />
          <Text text="We'll personalize your experience." style={s.subtitle} />
          <TextInput
            style={s.input}
            placeholder="Your name"
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={goNext}
          />
          <View style={s.spacer} />
          <TouchableOpacity style={s.btn} onPress={goNext}>
            <Text text="Continue" style={s.btnText} />
          </TouchableOpacity>
        </View>

        {/* Step 1: Goal */}
        <View style={s.slide}>
          <Text text="What's your goal?" style={s.title} />
          <Text text="This helps us tailor your AI coach." style={s.subtitle} />
          <View style={s.goalGrid}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[
                  s.goalCard,
                  {
                    borderColor: goal === g.key ? colors.tint : colors.border,
                    backgroundColor: goal === g.key ? colors.tint + "18" : colors.background,
                  },
                ]}
                onPress={() => setGoal(g.key)}
              >
                <Text text={g.emoji} style={s.goalEmoji} />
                <Text text={g.label} style={[s.goalLabel, { color: colors.text }]} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.spacer} />
          <TouchableOpacity style={s.btn} onPress={goNext}>
            <Text text="Continue" style={s.btnText} />
          </TouchableOpacity>
        </View>

        {/* Step 2: Weight unit */}
        <View style={s.slide}>
          <Text text="Weight unit?" style={s.title} />
          <Text text="Used when logging your sets." style={s.subtitle} />
          <View style={s.unitRow}>
            {(["kg", "lbs"] as WeightUnit[]).map((u) => (
              <TouchableOpacity
                key={u}
                style={[
                  s.unitBtn,
                  {
                    borderColor: unit === u ? colors.tint : colors.border,
                    backgroundColor: unit === u ? colors.tint + "18" : colors.background,
                  },
                ]}
                onPress={() => setUnit(u)}
              >
                <Text text={u} style={[s.unitLabel, { color: unit === u ? colors.tint : colors.text }]} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.spacer} />
          <TouchableOpacity style={[s.btn, !name.trim() && { opacity: 0.4 }]} onPress={finish}>
            <Text text="Let's go 🚀" style={s.btnText} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Screen>
  )
}
