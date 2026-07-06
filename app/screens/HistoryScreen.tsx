import { useCallback, useEffect, useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { useIsFocused } from "@react-navigation/native"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { getExerciseById } from "@/services/exerciseService"
import { getProfile } from "@/services/profileService"
import { getWorkouts, getWorkoutDates, type Workout } from "@/services/workoutService"
import { useAppTheme } from "@/theme/context"

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function MiniCalendar({
  month,
  workoutDates,
  selectedDate,
  onSelectDate,
  onChangeMonth,
  colors,
  spacing,
}: {
  month: Date
  workoutDates: Set<string>
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onChangeMonth: (dir: 1 | -1) => void
  colors: any
  spacing: any
}) {
  const start = startOfWeek(startOfMonth(month))
  const end = endOfWeek(endOfMonth(month))
  const days = eachDayOfInterval({ start, end })

  const s = StyleSheet.create({
    container: { backgroundColor: colors.background, marginHorizontal: spacing.md, borderRadius: 16, padding: spacing.md, marginBottom: spacing.md },
    monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
    monthLabel: { fontSize: 16, fontFamily: "spaceGroteskBold", color: colors.text },
    navBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
    navText: { fontSize: 18, color: colors.tint },
    weekRow: { flexDirection: "row", marginBottom: spacing.xs },
    dayHeader: { flex: 1, alignItems: "center" },
    dayHeaderText: { fontSize: 11, fontFamily: "spaceGroteskMedium", color: colors.textDim },
    weeksGrid: {},
    week: { flexDirection: "row", marginBottom: 4 },
    dayCell: { flex: 1, alignItems: "center", paddingVertical: 4 },
    dayInner: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    dayText: { fontSize: 13, fontFamily: "spaceGroteskMedium" },
    dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
  })

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <View style={s.container}>
      <View style={s.monthRow}>
        <TouchableOpacity style={s.navBtn} onPress={() => onChangeMonth(-1)}>
          <Text text="‹" style={s.navText} />
        </TouchableOpacity>
        <Text text={format(month, "MMMM yyyy")} style={s.monthLabel} />
        <TouchableOpacity style={s.navBtn} onPress={() => onChangeMonth(1)}>
          <Text text="›" style={s.navText} />
        </TouchableOpacity>
      </View>
      <View style={s.weekRow}>
        {WEEK_DAYS.map((d) => (
          <View key={d} style={s.dayHeader}>
            <Text text={d} style={s.dayHeaderText} />
          </View>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={s.week}>
          {week.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const hasWorkout = workoutDates.has(dateStr)
            const isSelected = selectedDate === dateStr
            const isToday = isSameDay(day, new Date())
            const inMonth = isSameMonth(day, month)

            return (
              <TouchableOpacity
                key={dateStr}
                style={s.dayCell}
                onPress={() => hasWorkout && onSelectDate(dateStr)}
              >
                <View
                  style={[
                    s.dayInner,
                    isSelected && { backgroundColor: colors.tint },
                    isToday && !isSelected && { borderWidth: 1.5, borderColor: colors.tint },
                  ]}
                >
                  <Text
                    text={format(day, "d")}
                    style={[
                      s.dayText,
                      { color: inMonth ? (isSelected ? "#fff" : colors.text) : colors.textDim },
                    ]}
                  />
                </View>
                {hasWorkout && (
                  <View style={[s.dot, { backgroundColor: isSelected ? "transparent" : colors.tint }]} />
                )}
              </TouchableOpacity>
            )
          })}
        </View>
      ))}
    </View>
  )
}

function WorkoutCard({ workout, unit, colors, spacing }: { workout: Workout; unit: string; colors: any; spacing: any }) {
  const [expanded, setExpanded] = useState(false)
  const totalSets = workout.exercises.reduce((acc, e) => acc + e.sets.length, 0)
  const completedSets = workout.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.completed).length, 0)
  const durationMs = (workout.completedAt ?? workout.startedAt) - workout.startedAt
  const durationMin = Math.round(durationMs / 60000)

  const s = StyleSheet.create({
    card: {
      marginHorizontal: spacing.md, marginBottom: spacing.sm,
      borderRadius: 14, borderWidth: 1, borderColor: colors.separator,
      backgroundColor: colors.background, overflow: "hidden",
    },
    header: {
      flexDirection: "row", alignItems: "center", padding: spacing.md,
      backgroundColor: colors.separator + "30",
    },
    dateCol: { flex: 1 },
    date: { fontSize: 15, fontFamily: "spaceGroteskBold", color: colors.text },
    meta: { fontSize: 12, color: colors.textDim, fontFamily: "spaceGroteskMedium", marginTop: 2 },
    stats: { alignItems: "flex-end" },
    statNum: { fontSize: 15, fontFamily: "spaceGroteskBold", color: colors.tint },
    statLabel: { fontSize: 11, color: colors.textDim, fontFamily: "spaceGroteskMedium" },
    body: { padding: spacing.md },
    exRow: { marginBottom: spacing.sm },
    exName: { fontSize: 14, fontFamily: "spaceGroteskSemiBold", color: colors.text, marginBottom: 4 },
    setRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    setTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.separator },
    setTagText: { fontSize: 12, fontFamily: "spaceGroteskMedium", color: colors.text },
  })

  const displayDate = format(parseISO(workout.date), "EEEE, MMM d")

  return (
    <View style={s.card}>
      <TouchableOpacity style={s.header} onPress={() => setExpanded((e) => !e)}>
        <View style={s.dateCol}>
          <Text text={displayDate} style={s.date} />
          <Text text={`${workout.exercises.length} exercises · ${durationMin}m`} style={s.meta} />
        </View>
        <View style={s.stats}>
          <Text text={`${completedSets}/${totalSets}`} style={s.statNum} />
          <Text text="sets done" style={s.statLabel} />
        </View>
        <Text text={expanded ? " ▲" : " ▼"} style={{ color: colors.textDim, marginLeft: 8 }} />
      </TouchableOpacity>
      {expanded && (
        <View style={s.body}>
          {workout.exercises.map((we, i) => {
            const ex = getExerciseById(we.exerciseId)
            return (
              <View key={i} style={s.exRow}>
                <Text text={ex?.name ?? we.exerciseId} style={s.exName} />
                <View style={s.setRow}>
                  {we.sets.map((set, si) => (
                    <View key={si} style={[s.setTag, set.completed && { backgroundColor: colors.tint + "25" }]}>
                      <Text
                        text={`${set.reps} × ${set.weight}${unit}`}
                        style={[s.setTagText, set.completed && { color: colors.tint }]}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

export function HistoryScreen() {
  const { theme: { colors, spacing } } = useAppTheme()
  const isFocused = useIsFocused()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set())
  const [month, setMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const profile = getProfile()

  useEffect(() => {
    if (isFocused) {
      const all = getWorkouts()
      setWorkouts(all)
      setWorkoutDates(getWorkoutDates())
    }
  }, [isFocused])

  const onChangeMonth = (dir: 1 | -1) => setMonth((m) => addMonths(m, dir))

  const displayedWorkouts = selectedDate
    ? workouts.filter((w) => w.date === selectedDate)
    : workouts

  const s = StyleSheet.create({
    header: { paddingTop: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    title: { fontSize: 28, fontFamily: "spaceGroteskBold", color: colors.text, marginBottom: 2 },
    subtext: { fontSize: 14, color: colors.textDim },
    clearFilter: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.md, marginBottom: spacing.sm, gap: 6 },
    clearBtn: { color: colors.tint, fontFamily: "spaceGroteskMedium", fontSize: 13 },
    empty: { alignItems: "center", paddingTop: 40 },
    emptyText: { color: colors.textDim, fontFamily: "spaceGroteskMedium", fontSize: 14 },
  })

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        <View style={s.header}>
          <Text text="History" style={s.title} />
          <Text text={`${workouts.length} total workouts`} style={s.subtext} />
        </View>

        <MiniCalendar
          month={month}
          workoutDates={workoutDates}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onChangeMonth={onChangeMonth}
          colors={colors}
          spacing={spacing}
        />

        {selectedDate && (
          <View style={s.clearFilter}>
            <Text text={`Showing ${format(parseISO(selectedDate), "MMM d")}`} style={{ color: colors.textDim, fontSize: 13 }} />
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Text text="× Clear" style={s.clearBtn} />
            </TouchableOpacity>
          </View>
        )}

        {displayedWorkouts.length === 0 ? (
          <View style={s.empty}>
            <Text text="No workouts yet. Start logging! 💪" style={s.emptyText} />
          </View>
        ) : (
          displayedWorkouts.map((w) => (
            <WorkoutCard key={w.id} workout={w} unit={profile.weightUnit} colors={colors} spacing={spacing} />
          ))
        )}
      </ScrollView>
    </Screen>
  )
}
