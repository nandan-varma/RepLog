# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start              # start Metro bundler (requires expo-dev-client build)
pnpm ios                # run on iOS simulator
pnpm android            # run on Android emulator
pnpm compile            # TypeScript type check (tsc --noEmit)
pnpm lint               # ESLint with auto-fix
pnpm lint:check         # ESLint without auto-fix
pnpm test               # Jest
pnpm test:watch         # Jest in watch mode
```

Run a single test file: `pnpm test -- app/components/Text.test.tsx`

The app uses `expo-dev-client` — `pnpm start` alone won't work without a dev build installed on device/simulator. Use `pnpm ios` or `pnpm android` to build and launch.

## Architecture

**Stack:** Expo 55 / React Native 0.83.2 / React 19, new architecture, Hermes JS engine, pnpm (`node-linker=hoisted`).

**Path aliases** (defined in `tsconfig.json`):
- `@/*` → `./app/*`
- `@assets/*` → `./assets/*`

### Navigation

React Navigation 7 (not Expo Router). Structure in `app/navigators/`:

```
AppNavigator (NativeStack)         — AppStackParamList
├── OnboardingScreen               — shown when profile.name is empty (isOnboarded())
└── MainNavigator (BottomTabs)     — MainTabParamList
    ├── ExercisesNavigator (Stack) — ExercisesStackParamList
    │   ├── ExerciseListScreen
    │   └── ExerciseDetailScreen
    ├── WorkoutScreen (Log tab)
    ├── HistoryScreen
    ├── AIChatScreen (AI Coach tab)
    └── ProfileScreen
```

Screen prop types are in `app/navigators/navigationTypes.ts`:
- `AppStackScreenProps<"Onboarding">` for top-level screens
- `MainTabScreenProps<"Log">` for tab screens
- `ExercisesStackScreenProps<"ExerciseDetail">` for nested stack screens

### Theming

`useAppTheme()` from `@/theme/context` — returns `{ theme, themed, themeContext, setThemeContextOverride }`.

Always destructure as `const { theme: { colors, spacing } } = useAppTheme()`.

All styles are defined inline with `StyleSheet.create({})` inside the component, using `colors.*` and `spacing.*` tokens. There is no global stylesheet. Do **not** import colors or spacing directly — always get them from `useAppTheme()` so dark mode works.

Color tokens: `text`, `textDim`, `background`, `border`, `separator`, `tint` (orange), `error`.  
Spacing tokens: `xxxs(2)`, `xxs(4)`, `xs(8)`, `sm(12)`, `md(16)`, `lg(24)`, `xl(32)`, `xxl(48)`, `xxxl(64)`.

Font family names (used directly in `fontFamily` style): `spaceGroteskLight`, `spaceGroteskRegular`, `spaceGroteskMedium`, `spaceGroteskSemiBold`, `spaceGroteskBold`.

`ThemedStyle<ViewStyle>` is for styles that need to vary by theme. Use `themed()` to resolve them.

### Storage

All persistence uses `react-native-mmkv`. Each service creates its own MMKV instance with a unique `id`:
- `exerciseService.ts` → `id: "exercise-storage"` — 873-exercise JSON cached at key `exercises_cache`
- `workoutService.ts` → `id: "workout-storage"` — `Workout[]` at key `workouts`
- `profileService.ts` → `id: "profile-storage"` — `UserProfile` at key `user_profile`

Never use AsyncStorage or other storage primitives.

### Services (`app/services/`)

**`exerciseService.ts`**: Fetches from `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json`, caches in MMKV, keeps in-memory after first load. Exports `getExercises()`, `getExerciseById(id)`, `filterExercises(exercises, filter)`, `getImageUrl(imagePath)`.

**`workoutService.ts`**: CRUD for workouts. Key exports: `getWorkouts()`, `getTodayWorkout()`, `saveWorkout(w)`, `startTodayWorkout()`, `getWorkoutDates()` → `Set<string>`.

**`profileService.ts`**: Single user profile. Key exports: `getProfile()`, `saveProfile(p)`, `isOnboarded()`, `toggleBookmark(id)`, `isBookmarked(id)`.

### AI Integration

`AIChatScreen.tsx` uses `streamText` from `ai` (v7) + `createAnthropic` from `@ai-sdk/anthropic` for direct client-side streaming — no server required. The user's Anthropic API key is stored in their profile (`profile.apiKey`). Model: `claude-haiku-4-5`.

```ts
const { textStream } = streamText({
  model: createAnthropic({ apiKey: profile.apiKey })("claude-haiku-4-5"),
  system: buildSystemPrompt(workouts),
  messages,
})
for await (const chunk of textStream) { /* append to last message */ }
```

### Ignite Components

Pre-built components in `app/components/`: `Screen`, `Text`, `Button`, `TextField`, `Card`, `Header`, `Icon`, `ListItem`, `EmptyState`. Prefer these over raw RN primitives for consistency.

`Screen` preset options: `"fixed"` (no scroll), `"scroll"` (ScrollView), `"auto"` (auto-scroll). Use `safeAreaEdges` prop to control safe area insets.

### Lists

Use `@shopify/flash-list` (v2) for any list with more than ~50 items. `estimatedItemSize` was removed in v2 — do not use it.

### Images

Use `expo-image`'s `<Image>` (not RN's built-in) for all exercise images. Supports `contentFit`, `transition`, and progressive loading.
