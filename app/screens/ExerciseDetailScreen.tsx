import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { Image } from "expo-image"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import {
  getExerciseById,
  getExercises,
  getImageUrl,
  type Exercise,
} from "@/services/exerciseService"
import { isBookmarked, toggleBookmark } from "@/services/profileService"
import { saveWorkout, startTodayWorkout } from "@/services/workoutService"
import { useAppTheme } from "@/theme/context"
import type { ExercisesStackScreenProps } from "@/navigators/navigationTypes"

const { width } = Dimensions.get("window")

const LEVEL_COLOR = {
  beginner: "#4ade80",
  intermediate: "#facc15",
  expert: "#f87171",
}

export function ExerciseDetailScreen({ route, navigation }: ExercisesStackScreenProps<"ExerciseDetail">) {
  const { theme: { colors, spacing } } = useAppTheme()
  const { exerciseId } = route.params
  const [exercise, setExercise] = useState<Exercise | undefined>(getExerciseById(exerciseId))
  const [imgIdx, setImgIdx] = useState(0)
  const [bookmarked, setBookmarked] = useState(isBookmarked(exerciseId))
  const [addedToWorkout, setAddedToWorkout] = useState(false)
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!exercise) {
      getExercises().then(() => setExercise(getExerciseById(exerciseId)))
    }
  }, [exercise, exerciseId])

  const switchImage = (idx: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setImgIdx(idx)
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start()
    })
  }

  const handleBookmark = () => {
    toggleBookmark(exerciseId)
    setBookmarked((b) => !b)
  }

  const handleAddToWorkout = () => {
    if (!exercise) return
    const workout = startTodayWorkout()
    if (!workout.exercises.find((e) => e.exerciseId === exerciseId)) {
      workout.exercises = [
        ...workout.exercises,
        { exerciseId, sets: [{ reps: 10, weight: 0, completed: false }] },
      ]
      saveWorkout(workout)
    }
    setAddedToWorkout(true)
    setTimeout(() => setAddedToWorkout(false), 2000)
  }

  if (!exercise) {
    return (
      <Screen preset="fixed" safeAreaEdges={["top"]}>
        <Text text="Loading…" style={{ color: colors.textDim, padding: 24 }} />
      </Screen>
    )
  }

  const levelColor = LEVEL_COLOR[exercise.level] ?? colors.textDim

  const s = StyleSheet.create({
    backBtn: {
      position: "absolute", top: spacing.md, left: spacing.md, zIndex: 10,
      backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 7,
    },
    bookmarkBtn: {
      position: "absolute", top: spacing.md, right: spacing.md, zIndex: 10,
      backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 20,
      paddingHorizontal: 12, paddingVertical: 7,
    },
    imageDots: {
      position: "absolute", bottom: spacing.sm,
      flexDirection: "row", gap: 6, alignSelf: "center",
    },
    dot: { width: 7, height: 7, borderRadius: 4 },
    content: { padding: spacing.md },
    name: { fontSize: 26, fontFamily: "spaceGroteskBold", color: colors.text, marginBottom: spacing.sm },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.md },
    chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    chipText: { fontSize: 12, fontFamily: "spaceGroteskMedium" },
    section: { marginBottom: spacing.md },
    sectionTitle: { fontSize: 13, fontFamily: "spaceGroteskBold", color: colors.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.xs },
    muscleRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
    muscleChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.separator },
    muscleText: { fontSize: 13, fontFamily: "spaceGroteskMedium", color: colors.text },
    step: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
    stepNum: {
      width: 26, height: 26, borderRadius: 13, backgroundColor: colors.tint,
      alignItems: "center", justifyContent: "center", marginTop: 1,
    },
    stepNumText: { color: "#fff", fontSize: 13, fontFamily: "spaceGroteskBold" },
    stepText: { flex: 1, fontSize: 14, fontFamily: "spaceGroteskRegular", color: colors.text, lineHeight: 21 },
    floatingBtn: {
      margin: spacing.md, marginTop: 0,
      backgroundColor: addedToWorkout ? "#4ade80" : colors.tint,
      borderRadius: 14, paddingVertical: spacing.md,
      alignItems: "center",
    },
    floatingBtnText: { color: "#fff", fontSize: 16, fontFamily: "spaceGroteskBold" },
  })

  return (
    <Screen preset="fixed" safeAreaEdges={["bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Image header */}
      <View style={{ height: 280, position: "relative" }}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text text="← Back" style={{ color: "#fff", fontFamily: "spaceGroteskMedium", fontSize: 13 }} />
        </TouchableOpacity>
        <TouchableOpacity style={s.bookmarkBtn} onPress={handleBookmark}>
          <Text text={bookmarked ? "★" : "☆"} style={{ color: bookmarked ? "#facc15" : "#fff", fontSize: 16 }} />
        </TouchableOpacity>

        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <Image
            source={{ uri: getImageUrl(exercise.images[imgIdx]) }}
            style={{ width, height: 280 }}
            contentFit="cover"
          />
        </Animated.View>

        {/* Image switcher dots */}
        <View style={s.imageDots}>
          {exercise.images.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => switchImage(i)}>
              <View style={[s.dot, { backgroundColor: imgIdx === i ? "#fff" : "rgba(255,255,255,0.4)" }]} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={s.content}>
          <Text text={exercise.name} style={s.name} />

          {/* Chips row */}
          <View style={s.chips}>
            <View style={[s.chip, { backgroundColor: levelColor + "28" }]}>
              <Text text={exercise.level} style={[s.chipText, { color: levelColor }]} />
            </View>
            <View style={[s.chip, { backgroundColor: colors.separator }]}>
              <Text text={exercise.category} style={[s.chipText, { color: colors.text }]} />
            </View>
            {exercise.mechanic && (
              <View style={[s.chip, { backgroundColor: colors.separator }]}>
                <Text text={exercise.mechanic} style={[s.chipText, { color: colors.text }]} />
              </View>
            )}
            {exercise.force && (
              <View style={[s.chip, { backgroundColor: colors.separator }]}>
                <Text text={exercise.force} style={[s.chipText, { color: colors.text }]} />
              </View>
            )}
            <View style={[s.chip, { backgroundColor: colors.separator }]}>
              <Text text={exercise.equipment} style={[s.chipText, { color: colors.text }]} />
            </View>
          </View>

          {/* Muscles */}
          <View style={s.section}>
            <Text text="Primary Muscles" style={s.sectionTitle} />
            <View style={s.muscleRow}>
              {exercise.primaryMuscles.map((m) => (
                <View key={m} style={[s.muscleChip, { backgroundColor: colors.tint + "25" }]}>
                  <Text text={m} style={[s.muscleText, { color: colors.tint }]} />
                </View>
              ))}
            </View>
          </View>

          {exercise.secondaryMuscles.length > 0 && (
            <View style={s.section}>
              <Text text="Secondary Muscles" style={s.sectionTitle} />
              <View style={s.muscleRow}>
                {exercise.secondaryMuscles.map((m) => (
                  <View key={m} style={s.muscleChip}>
                    <Text text={m} style={s.muscleText} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          <View style={s.section}>
            <Text text="Instructions" style={s.sectionTitle} />
            {exercise.instructions.map((step, i) => (
              <View key={i} style={s.step}>
                <View style={s.stepNum}>
                  <Text text={String(i + 1)} style={s.stepNumText} />
                </View>
                <Text text={step} style={s.stepText} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={s.floatingBtn} onPress={handleAddToWorkout}>
        <Text
          text={addedToWorkout ? "✓ Added to Today's Workout" : "＋ Add to Workout"}
          style={s.floatingBtnText}
        />
      </TouchableOpacity>
    </Screen>
  )
}
