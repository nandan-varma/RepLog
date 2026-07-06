import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useIsFocused } from "@react-navigation/native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { getExerciseById, getExercises } from "@/services/exerciseService"
import { getProfile } from "@/services/profileService"
import {
  deleteWorkout,
  saveWorkout,
  startTodayWorkout,
  getTodayWorkout,
  type Workout,
  type WorkoutExercise,
  type WorkoutSet,
} from "@/services/workoutService"
import { useAppTheme } from "@/theme/context"
import type { MainTabScreenProps } from "@/navigators/navigationTypes"

function SetRow({
  set,
  idx,
  unit,
  onChange,
  onDelete,
  colors,
}: {
  set: WorkoutSet
  idx: number
  unit: string
  onChange: (set: WorkoutSet) => void
  onDelete: () => void
  colors: any
}) {
  const s = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    setNum: { width: 28, alignItems: "center" },
    setNumText: { fontSize: 13, fontFamily: "spaceGroteskBold", color: colors.textDim },
    input: {
      width: 64, textAlign: "center",
      borderWidth: 1, borderColor: set.completed ? colors.tint : colors.border,
      borderRadius: 8, paddingVertical: 6,
      fontSize: 16, fontFamily: "spaceGroteskBold", color: colors.text,
      backgroundColor: set.completed ? colors.tint + "15" : colors.background,
    },
    label: { fontSize: 12, color: colors.textDim, fontFamily: "spaceGroteskMedium", width: 30 },
    checkBtn: {
      width: 36, height: 36, borderRadius: 18,
      borderWidth: 1.5, borderColor: set.completed ? colors.tint : colors.border,
      backgroundColor: set.completed ? colors.tint : "transparent",
      alignItems: "center", justifyContent: "center",
    },
    delBtn: { paddingHorizontal: 6 },
  })

  return (
    <View style={s.row}>
      <View style={s.setNum}>
        <Text text={String(idx + 1)} style={s.setNumText} />
      </View>
      <TextInput
        style={s.input}
        value={String(set.reps)}
        onChangeText={(t) => onChange({ ...set, reps: parseInt(t) || 0 })}
        keyboardType="numeric"
        selectTextOnFocus
      />
      <Text text="reps" style={s.label} />
      <TextInput
        style={s.input}
        value={String(set.weight)}
        onChangeText={(t) => onChange({ ...set, weight: parseFloat(t) || 0 })}
        keyboardType="decimal-pad"
        selectTextOnFocus
      />
      <Text text={unit} style={s.label} />
      <TouchableOpacity style={s.checkBtn} onPress={() => onChange({ ...set, completed: !set.completed })}>
        {set.completed && <Text text="✓" style={{ color: "#fff", fontSize: 14, fontFamily: "spaceGroteskBold" }} />}
      </TouchableOpacity>
      <TouchableOpacity style={s.delBtn} onPress={onDelete}>
        <Text text="✕" style={{ color: colors.textDim, fontSize: 12 }} />
      </TouchableOpacity>
    </View>
  )
}

function ExerciseBlock({
  we,
  unit,
  onChange,
  onRemove,
  colors,
  spacing,
}: {
  we: WorkoutExercise
  unit: string
  onChange: (updated: WorkoutExercise) => void
  onRemove: () => void
  colors: any
  spacing: any
}) {
  const ex = getExerciseById(we.exerciseId)
  const [expanded, setExpanded] = useState(true)

  const addSet = () => {
    const last = we.sets[we.sets.length - 1] ?? { reps: 10, weight: 0, completed: false }
    onChange({ ...we, sets: [...we.sets, { ...last, completed: false }] })
  }

  const updateSet = (idx: number, set: WorkoutSet) => {
    const sets = [...we.sets]
    sets[idx] = set
    onChange({ ...we, sets })
  }

  const deleteSet = (idx: number) => {
    onChange({ ...we, sets: we.sets.filter((_, i) => i !== idx) })
  }

  const completedCount = we.sets.filter((s) => s.completed).length
  const s = StyleSheet.create({
    block: {
      backgroundColor: colors.background,
      borderRadius: 14, marginHorizontal: spacing.md, marginBottom: spacing.sm,
      borderWidth: 1, borderColor: colors.separator,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      backgroundColor: colors.separator + "40",
    },
    exName: { flex: 1, fontSize: 15, fontFamily: "spaceGroteskBold", color: colors.text },
    progress: { fontSize: 12, fontFamily: "spaceGroteskMedium", color: colors.textDim },
    body: { padding: spacing.md },
    addSetBtn: {
      alignItems: "center", paddingVertical: spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator,
    },
  })

  return (
    <View style={s.block}>
      <TouchableOpacity style={s.header} onPress={() => setExpanded((e) => !e)} onLongPress={onRemove}>
        <Text text={ex?.name ?? we.exerciseId} style={s.exName} numberOfLines={1} />
        <Text text={`${completedCount}/${we.sets.length} sets`} style={s.progress} />
        <Text text={expanded ? " ▲" : " ▼"} style={{ color: colors.textDim }} />
      </TouchableOpacity>
      {expanded && (
        <View style={s.body}>
          {we.sets.map((set, i) => (
            <SetRow
              key={i}
              set={set}
              idx={i}
              unit={unit}
              onChange={(updated) => updateSet(i, updated)}
              onDelete={() => deleteSet(i)}
              colors={colors}
            />
          ))}
          <TouchableOpacity style={s.addSetBtn} onPress={addSet}>
            <Text text="＋ Add Set" style={{ color: colors.tint, fontFamily: "spaceGroteskSemiBold", fontSize: 13 }} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

function SummaryModal({
  workout,
  visible,
  onClose,
  colors,
  spacing,
}: {
  workout: Workout
  visible: boolean
  onClose: () => void
  colors: any
  spacing: any
}) {
  const totalSets = workout.exercises.reduce((acc, e) => acc + e.sets.length, 0)
  const completedSets = workout.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.completed).length, 0)
  const durationMs = (workout.completedAt ?? Date.now()) - workout.startedAt
  const durationMin = Math.round(durationMs / 60000)

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 24 },
    card: { backgroundColor: colors.background, borderRadius: 20, padding: 28, alignItems: "center" },
    emoji: { fontSize: 48, marginBottom: 12 },
    title: { fontSize: 24, fontFamily: "spaceGroteskBold", color: colors.text, marginBottom: 20 },
    statsRow: { flexDirection: "row", gap: 20, marginBottom: 24 },
    stat: { alignItems: "center" },
    statNum: { fontSize: 28, fontFamily: "spaceGroteskBold", color: colors.tint },
    statLabel: { fontSize: 12, fontFamily: "spaceGroteskMedium", color: colors.textDim },
    btn: {
      backgroundColor: colors.tint, borderRadius: 12,
      paddingHorizontal: 40, paddingVertical: 14,
    },
    btnText: { color: "#fff", fontSize: 16, fontFamily: "spaceGroteskBold" },
  })

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.card}>
          <Text text="🎉" style={s.emoji} />
          <Text text="Workout Complete!" style={s.title} />
          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text text={String(workout.exercises.length)} style={s.statNum} />
              <Text text="Exercises" style={s.statLabel} />
            </View>
            <View style={s.stat}>
              <Text text={`${completedSets}/${totalSets}`} style={s.statNum} />
              <Text text="Sets" style={s.statLabel} />
            </View>
            <View style={s.stat}>
              <Text text={`${durationMin}m`} style={s.statNum} />
              <Text text="Duration" style={s.statLabel} />
            </View>
          </View>
          <TouchableOpacity style={s.btn} onPress={onClose}>
            <Text text="Done" style={s.btnText} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export function WorkoutScreen({ navigation }: MainTabScreenProps<"Log">) {
  const { theme: { colors, spacing } } = useAppTheme()
  const isFocused = useIsFocused()
  const [workout, setWorkout] = useState<Workout | undefined>()
  const [showSummary, setShowSummary] = useState(false)
  const profile = getProfile()

  useEffect(() => {
    if (isFocused) {
      setWorkout(getTodayWorkout())
      getExercises() // ensure cache loaded
    }
  }, [isFocused])

  const refresh = () => setWorkout(getTodayWorkout())

  const handleStart = () => {
    const w = startTodayWorkout()
    setWorkout(w)
  }

  const updateExercise = (idx: number, updated: WorkoutExercise) => {
    if (!workout) return
    const exercises = [...workout.exercises]
    exercises[idx] = updated
    const updated_workout = { ...workout, exercises }
    saveWorkout(updated_workout)
    setWorkout(updated_workout)
  }

  const removeExercise = (idx: number) => {
    if (!workout) return
    Alert.alert("Remove Exercise", "Remove this exercise from today's workout?", [
      { text: "Cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: () => {
          const exercises = workout.exercises.filter((_, i) => i !== idx)
          const updated = { ...workout, exercises }
          saveWorkout(updated)
          setWorkout(updated)
        },
      },
    ])
  }

  const handleFinish = () => {
    if (!workout) return
    const completed = { ...workout, completedAt: Date.now() }
    saveWorkout(completed)
    setWorkout(completed)
    setShowSummary(true)
  }

  const s = StyleSheet.create({
    header: { paddingTop: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    title: { fontSize: 28, fontFamily: "spaceGroteskBold", color: colors.text },
    subtext: { fontSize: 14, color: colors.textDim, fontFamily: "spaceGroteskMedium", marginTop: 2 },
    emptyState: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
    emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
    emptyTitle: { fontSize: 22, fontFamily: "spaceGroteskBold", color: colors.text, marginBottom: spacing.xs, textAlign: "center" },
    emptySubtitle: { fontSize: 14, color: colors.textDim, textAlign: "center", marginBottom: spacing.xl },
    startBtn: { backgroundColor: colors.tint, borderRadius: 14, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
    startBtnText: { color: "#fff", fontSize: 16, fontFamily: "spaceGroteskBold" },
    addExBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      marginHorizontal: spacing.md, marginVertical: spacing.xs,
      paddingVertical: spacing.sm, borderRadius: 12,
      borderWidth: 1.5, borderColor: colors.border, borderStyle: "dashed",
    },
    finishBtn: {
      margin: spacing.md, marginTop: spacing.xs,
      backgroundColor: colors.tint, borderRadius: 14,
      paddingVertical: spacing.md, alignItems: "center",
    },
  })

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={s.header}>
        <Text text="Today's Workout" style={s.title} />
        <Text text={today} style={s.subtext} />
      </View>

      {!workout ? (
        <View style={s.emptyState}>
          <Text text="🏋️" style={s.emptyEmoji} />
          <Text text="No workout yet" style={s.emptyTitle} />
          <Text text="Start tracking your sets, reps, and weights." style={s.emptySubtitle} />
          <TouchableOpacity style={s.startBtn} onPress={handleStart}>
            <Text text="Start Workout" style={s.startBtnText} />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {workout.exercises.map((we, i) => (
            <ExerciseBlock
              key={we.exerciseId + i}
              we={we}
              unit={profile.weightUnit}
              onChange={(updated) => updateExercise(i, updated)}
              onRemove={() => removeExercise(i)}
              colors={colors}
              spacing={spacing}
            />
          ))}

          <TouchableOpacity
            style={s.addExBtn}
            onPress={() =>
              navigation.navigate("Exercises", {
                screen: "ExerciseList",
                params: { selectMode: true },
              })
            }
          >
            <Text text="＋ Add Exercise" style={{ color: colors.tint, fontFamily: "spaceGroteskSemiBold", fontSize: 15 }} />
          </TouchableOpacity>

          {workout.exercises.length > 0 && !workout.completedAt && (
            <TouchableOpacity style={s.finishBtn} onPress={handleFinish}>
              <Text text="Finish Workout ✓" style={{ color: "#fff", fontSize: 16, fontFamily: "spaceGroteskBold" }} />
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {workout && (
        <SummaryModal
          workout={workout}
          visible={showSummary}
          onClose={() => { setShowSummary(false); refresh() }}
          colors={colors}
          spacing={spacing}
        />
      )}
    </Screen>
  )
}
