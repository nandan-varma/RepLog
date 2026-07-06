import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { FlashList } from "@shopify/flash-list"
import { Image } from "expo-image"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import {
  filterExercises,
  getExercises,
  getImageUrl,
  type Exercise,
  type ExerciseFilter,
} from "@/services/exerciseService"
import { isBookmarked, toggleBookmark } from "@/services/profileService"
import { saveWorkout, startTodayWorkout } from "@/services/workoutService"
import { useAppTheme } from "@/theme/context"
import type { ExercisesStackScreenProps } from "@/navigators/navigationTypes"

const MUSCLES = [
  "chest", "shoulders", "triceps", "biceps", "forearms",
  "lats", "middle back", "lower back", "traps",
  "abdominals", "glutes", "quadriceps", "hamstrings", "calves",
  "abductors", "adductors", "neck",
]
const EQUIPMENT = [
  "body only", "barbell", "dumbbell", "cable", "machine",
  "kettlebells", "bands", "exercise ball",
]
const LEVELS = ["beginner", "intermediate", "expert"]
const CATEGORIES = ["strength", "cardio", "stretching", "powerlifting", "plyometrics", "olympic weightlifting"]

type FilterTab = "muscle" | "equipment" | "level" | "category"

function AnimatedExerciseImage({ exercise }: { exercise: Exercise }) {
  const [imgIdx, setImgIdx] = useState(0)
  const opacity = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const timer = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
      setImgIdx((i) => (i === 0 ? 1 : 0))
    }, 2000)
    return () => clearInterval(timer)
  }, [opacity])

  return (
    <Animated.View style={{ opacity }}>
      <Image
        source={{ uri: getImageUrl(exercise.images[imgIdx]) }}
        style={{ width: 72, height: 72, borderRadius: 10 }}
        contentFit="cover"
        transition={150}
      />
    </Animated.View>
  )
}

function ExerciseCard({
  exercise,
  onPress,
  onLongPress,
  selectMode,
  colors,
}: {
  exercise: Exercise
  onPress: () => void
  onLongPress: () => void
  selectMode: boolean
  colors: any
}) {
  const s = StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 12,
    },
    info: { flex: 1 },
    name: { fontSize: 15, fontFamily: "spaceGroteskSemiBold", color: colors.text, marginBottom: 3 },
    tags: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
    tag: {
      paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
      backgroundColor: colors.separator,
    },
    tagText: { fontSize: 11, fontFamily: "spaceGroteskMedium", color: colors.textDim },
    levelBadge: {
      paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
    },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.separator, marginLeft: 16 + 72 + 12 },
  })

  const levelColor = {
    beginner: "#4ade80",
    intermediate: "#facc15",
    expert: "#f87171",
  }[exercise.level] ?? colors.textDim

  return (
    <>
      <TouchableOpacity style={s.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
        <AnimatedExerciseImage exercise={exercise} />
        <View style={s.info}>
          <Text text={exercise.name} style={s.name} numberOfLines={1} />
          <View style={s.tags}>
            <View style={[s.levelBadge, { backgroundColor: levelColor + "28" }]}>
              <Text text={exercise.level} style={[s.tagText, { color: levelColor }]} />
            </View>
            {exercise.primaryMuscles.slice(0, 2).map((m) => (
              <View key={m} style={s.tag}>
                <Text text={m} style={s.tagText} />
              </View>
            ))}
          </View>
        </View>
        {selectMode && (
          <Text text="+ Add" style={{ color: colors.tint, fontFamily: "spaceGroteskSemiBold", fontSize: 13 }} />
        )}
      </TouchableOpacity>
      <View style={s.divider} />
    </>
  )
}

function FilterChip({ label, active, onPress, colors }: { label: string; active: boolean; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity
      style={{
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: active ? colors.tint : colors.separator,
        marginRight: 8,
      }}
      onPress={onPress}
    >
      <Text
        text={label}
        style={{
          fontSize: 13, fontFamily: "spaceGroteskMedium",
          color: active ? "#fff" : colors.text,
        }}
      />
    </TouchableOpacity>
  )
}

export function ExerciseListScreen({ navigation, route }: ExercisesStackScreenProps<"ExerciseList">) {
  const { theme: { colors, spacing } } = useAppTheme()
  const selectMode = route?.params?.selectMode ?? false

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<ExerciseFilter>({})
  const [activeTab, setActiveTab] = useState<FilterTab>("muscle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    getExercises().then((data) => {
      setExercises(data)
      setLoading(false)
    })
  }, [])

  const onSearchChange = (text: string) => {
    setSearch(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilter((f) => ({ ...f, search: text || undefined }))
    }, 300)
  }

  const setFilterKey = (key: keyof ExerciseFilter, value: string | undefined) => {
    setFilter((f) => {
      const next = { ...f }
      if (next[key] === value) {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
  }

  const filtered = filterExercises(exercises, filter)

  const handlePress = useCallback(
    (exercise: Exercise) => {
      if (selectMode) {
        const workout = startTodayWorkout()
        const updated = { ...workout }
        if (!updated.exercises.find((e) => e.exerciseId === exercise.id)) {
          updated.exercises = [...updated.exercises, { exerciseId: exercise.id, sets: [{ reps: 10, weight: 0, completed: false }] }]
          saveWorkout(updated)
        }
        navigation.goBack()
      } else {
        navigation.navigate("ExerciseDetail", { exerciseId: exercise.id })
      }
    },
    [selectMode, navigation],
  )

  const handleLongPress = useCallback((exercise: Exercise) => {
    toggleBookmark(exercise.id)
  }, [])

  const filterOptions: Record<FilterTab, string[]> = {
    muscle: MUSCLES,
    equipment: EQUIPMENT,
    level: LEVELS,
    category: CATEGORIES,
  }
  const filterKeys: Record<FilterTab, keyof ExerciseFilter> = {
    muscle: "muscle",
    equipment: "equipment",
    level: "level",
    category: "category",
  }

  const s = StyleSheet.create({
    header: { paddingTop: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: 0, backgroundColor: colors.background },
    title: { fontSize: 28, fontFamily: "spaceGroteskBold", color: colors.text, marginBottom: spacing.sm },
    searchBar: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.separator + "80",
      borderRadius: 12, paddingHorizontal: spacing.sm,
      marginBottom: spacing.xs,
    },
    searchInput: {
      flex: 1, paddingVertical: spacing.sm, fontSize: 15,
      fontFamily: "spaceGroteskRegular", color: colors.text,
    },
    filterTabs: { flexDirection: "row", gap: spacing.xs, marginBottom: spacing.xs },
    filterTab: {
      paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs + 2,
      borderRadius: 8, borderWidth: 1,
    },
    count: { fontSize: 12, color: colors.textDim, fontFamily: "spaceGroteskMedium", marginBottom: spacing.xs },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
  })

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={s.header}>
        {selectMode
          ? <Text text="Add Exercise" style={s.title} />
          : <Text text="Exercises" style={s.title} />
        }
        <View style={s.searchBar}>
          <Text text="🔍 " style={{ color: colors.textDim }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textDim}
            value={search}
            onChangeText={onSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => { setSearch(""); setFilter((f) => ({ ...f, search: undefined })) }}>
              <Text text="✕" style={{ color: colors.textDim, paddingHorizontal: 8 }} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter type tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.xs }}>
          {(["muscle", "equipment", "level", "category"] as FilterTab[]).map((tab) => {
            const hasFilter = !!filter[filterKeys[tab]]
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  s.filterTab,
                  {
                    borderColor: activeTab === tab ? colors.tint : colors.border,
                    backgroundColor: hasFilter ? colors.tint + "20" : colors.background,
                  },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  text={tab.charAt(0).toUpperCase() + tab.slice(1) + (hasFilter ? " ✓" : "")}
                  style={{ fontSize: 12, fontFamily: "spaceGroteskMedium", color: activeTab === tab ? colors.tint : colors.text }}
                />
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* Filter options */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.xs }}>
          <FilterChip
            label="All"
            active={!filter[filterKeys[activeTab]]}
            onPress={() => setFilterKey(filterKeys[activeTab], undefined)}
            colors={colors}
          />
          {filterOptions[activeTab].map((opt) => (
            <FilterChip
              key={opt}
              label={opt}
              active={filter[filterKeys[activeTab]] === opt}
              onPress={() => setFilterKey(filterKeys[activeTab], opt)}
              colors={colors}
            />
          ))}
        </ScrollView>

        <Text text={`${filtered.length} exercises`} style={s.count} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.tint} size="large" />
          <Text text="Loading exercises…" style={{ color: colors.textDim, marginTop: 12 }} />
        </View>
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExerciseCard
              exercise={item}
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
              selectMode={selectMode}
              colors={colors}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </Screen>
  )
}
