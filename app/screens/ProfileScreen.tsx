import { useEffect, useState } from "react"
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useIsFocused } from "@react-navigation/native"
import { Image } from "expo-image"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { getExerciseById, getImageUrl } from "@/services/exerciseService"
import {
  getProfile,
  saveProfile,
  type FitnessGoal,
  type UserProfile,
  type WeightUnit,
} from "@/services/profileService"
import { getWorkouts } from "@/services/workoutService"
import { useAppTheme } from "@/theme/context"

const GOALS: { key: FitnessGoal; label: string; emoji: string }[] = [
  { key: "build_muscle", label: "Build Muscle", emoji: "💪" },
  { key: "lose_weight", label: "Lose Weight", emoji: "🔥" },
  { key: "improve_endurance", label: "Endurance", emoji: "🏃" },
  { key: "stay_active", label: "Stay Active", emoji: "✨" },
]

function calcStreak(workouts: ReturnType<typeof getWorkouts>): number {
  if (!workouts.length) return 0
  const dates = [...new Set(workouts.map((w) => w.date))].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let cursor = new Date(today)
  for (const d of dates) {
    const expected = cursor.toISOString().slice(0, 10)
    if (d !== expected) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function ProfileScreen() {
  const { theme: { colors, spacing } } = useAppTheme()
  const isFocused = useIsFocused()
  const [profile, setProfile] = useState<UserProfile>(getProfile())
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (isFocused) setProfile(getProfile())
  }, [isFocused])

  const update = (patch: Partial<UserProfile>) => {
    const updated = { ...profile, ...patch }
    setProfile(updated)
    saveProfile(updated)
  }

  const workouts = getWorkouts()
  const totalSets = workouts.reduce((acc, w) => acc + w.exercises.reduce((a, e) => a + e.sets.length, 0), 0)
  const streak = calcStreak(workouts)

  const s = StyleSheet.create({
    header: { paddingTop: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    title: { fontSize: 28, fontFamily: "spaceGroteskBold", color: colors.text },
    section: {
      marginHorizontal: spacing.md, marginBottom: spacing.md,
      backgroundColor: colors.background, borderRadius: 14,
      borderWidth: 1, borderColor: colors.separator,
      overflow: "hidden",
    },
    sectionTitle: {
      fontSize: 11, fontFamily: "spaceGroteskBold", color: colors.textDim,
      textTransform: "uppercase", letterSpacing: 1,
      paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs,
    },
    row: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator,
    },
    firstRow: { borderTopWidth: 0 },
    rowLabel: { fontSize: 15, fontFamily: "spaceGroteskMedium", color: colors.text, flex: 1 },
    nameInput: {
      flex: 1, fontSize: 15, fontFamily: "spaceGroteskRegular", color: colors.text,
      textAlign: "right",
    },
    keyInput: {
      flex: 1, fontSize: 14, fontFamily: "spaceGroteskRegular", color: colors.text,
      textAlign: "right",
    },
    unitToggle: { flexDirection: "row", gap: spacing.xs },
    unitBtn: {
      paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: 8,
      borderWidth: 1,
    },
    unitBtnText: { fontSize: 13, fontFamily: "spaceGroteskBold" },
    goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, padding: spacing.md },
    goalBtn: { flex: 1, minWidth: "45%", borderRadius: 12, borderWidth: 1.5, padding: spacing.sm, alignItems: "center", gap: 4 },
    goalEmoji: { fontSize: 22 },
    goalLabel: { fontSize: 12, fontFamily: "spaceGroteskMedium", textAlign: "center" },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: spacing.md, marginBottom: spacing.md,
      gap: spacing.sm,
    },
    stat: {
      flex: 1, backgroundColor: colors.background, borderRadius: 14,
      borderWidth: 1, borderColor: colors.separator,
      alignItems: "center", paddingVertical: spacing.md,
    },
    statNum: { fontSize: 22, fontFamily: "spaceGroteskBold", color: colors.tint },
    statLabel: { fontSize: 11, fontFamily: "spaceGroteskMedium", color: colors.textDim, marginTop: 2 },
    bookmarksScroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    bookmarkCard: {
      width: 100, marginRight: spacing.sm, borderRadius: 12,
      borderWidth: 1, borderColor: colors.separator, overflow: "hidden",
      backgroundColor: colors.background,
    },
    bookmarkName: { fontSize: 11, fontFamily: "spaceGroteskMedium", color: colors.text, padding: 6 },
    emptyBookmarks: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  })

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.header}>
          <Text text="Profile" style={s.title} />
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text text={String(workouts.length)} style={s.statNum} />
            <Text text="Workouts" style={s.statLabel} />
          </View>
          <View style={s.stat}>
            <Text text={String(totalSets)} style={s.statNum} />
            <Text text="Total Sets" style={s.statLabel} />
          </View>
          <View style={s.stat}>
            <Text text={`${streak}🔥`} style={s.statNum} />
            <Text text="Day Streak" style={s.statLabel} />
          </View>
        </View>

        {/* Personal */}
        <View style={s.section}>
          <Text text="Personal" style={s.sectionTitle} />
          <View style={[s.row, s.firstRow]}>
            <Text text="Name" style={s.rowLabel} />
            <TextInput
              style={s.nameInput}
              value={profile.name}
              onChangeText={(name) => update({ name })}
              placeholder="Your name"
              placeholderTextColor={colors.textDim}
              returnKeyType="done"
            />
          </View>
          <View style={s.row}>
            <Text text="Weight Unit" style={s.rowLabel} />
            <View style={s.unitToggle}>
              {(["kg", "lbs"] as WeightUnit[]).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[
                    s.unitBtn,
                    {
                      borderColor: profile.weightUnit === u ? colors.tint : colors.border,
                      backgroundColor: profile.weightUnit === u ? colors.tint + "20" : "transparent",
                    },
                  ]}
                  onPress={() => update({ weightUnit: u })}
                >
                  <Text text={u} style={[s.unitBtnText, { color: profile.weightUnit === u ? colors.tint : colors.text }]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Fitness Goal */}
        <View style={s.section}>
          <Text text="Fitness Goal" style={s.sectionTitle} />
          <View style={s.goalGrid}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g.key}
                style={[
                  s.goalBtn,
                  {
                    borderColor: profile.fitnessGoal === g.key ? colors.tint : colors.border,
                    backgroundColor: profile.fitnessGoal === g.key ? colors.tint + "18" : colors.background,
                  },
                ]}
                onPress={() => update({ fitnessGoal: g.key })}
              >
                <Text text={g.emoji} style={s.goalEmoji} />
                <Text text={g.label} style={[s.goalLabel, { color: profile.fitnessGoal === g.key ? colors.tint : colors.text }]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Coach */}
        <View style={s.section}>
          <Text text="AI Coach" style={s.sectionTitle} />
          <View style={[s.row, s.firstRow]}>
            <Text text="Anthropic API Key" style={s.rowLabel} />
            <TouchableOpacity onPress={() => setShowKey((v) => !v)}>
              <Text text={showKey ? "Hide" : "Show"} style={{ color: colors.tint, fontSize: 13, fontFamily: "spaceGroteskMedium" }} />
            </TouchableOpacity>
          </View>
          <View style={[s.row, { paddingTop: 0 }]}>
            <TextInput
              style={[s.keyInput, { flex: 1 }]}
              value={profile.apiKey}
              onChangeText={(apiKey) => update({ apiKey })}
              placeholder="sk-ant-..."
              placeholderTextColor={colors.textDim}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* Bookmarks */}
        <View style={[s.section, { overflow: "visible" }]}>
          <Text text="Bookmarks" style={s.sectionTitle} />
          {profile.bookmarks.length === 0 ? (
            <View style={s.emptyBookmarks}>
              <Text text="No bookmarks yet. Long-press exercises to save them." style={{ color: colors.textDim, fontSize: 13 }} />
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.bookmarksScroll}
            >
              {profile.bookmarks.map((id) => {
                const ex = getExerciseById(id)
                if (!ex) return null
                return (
                  <View key={id} style={s.bookmarkCard}>
                    <Image
                      source={{ uri: getImageUrl(ex.images[0]) }}
                      style={{ width: 100, height: 70 }}
                      contentFit="cover"
                    />
                    <Text text={ex.name} style={s.bookmarkName} numberOfLines={2} />
                  </View>
                )
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </Screen>
  )
}
