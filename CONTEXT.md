# RepLog — Deployment Context (as of 2026-07-28, session paused)

This file captures exactly where store/testing setup stands so a future session can resume without re-deriving everything. User said "stop everything for now" mid-way through Android screenshot uploads — this doc is the handoff.

## Quick status

- **iOS**: DONE. Build 4 (with today's UI fixes) finished on EAS, was submitted via `eas submit`, passed Apple's processing (`processingState: VALID`), and is live in TestFlight's Internal group (which has `hasAccessToAllBuilds: true`, so no manual per-build linking was needed). Both build 3 and build 4 now show in TestFlight; build 4 is the current one testers should use.
- **Android**: skipped per user request. A fresh AAB (versionCode 3, same fixes as iOS build 4) is built and downloaded locally, but not yet uploaded to Play Console — blocked on file size (see below).

## Uncommitted changes — COMMIT THESE FIRST if resuming

User's standing preference is "commit after each significant change." These were never committed:

```
 M .gitignore
 M app/eas.json
 M app/package.json
 M app/src/app/(tabs)/_layout.tsx
 M app/src/app/(tabs)/coach.tsx
 M app/src/app/_layout.tsx
 M app/src/app/workout/[id].tsx
 M pnpm-lock.yaml
```

What's in them:
- **`app/src/app/(tabs)/_layout.tsx`**: added real tab bar icons via `@expo/vector-icons` (Ionicons, outline/filled pairs — square/grid/time/chatbubble). Previously there were NO icons at all (React Navigation's default fallback triangle glyphs were showing) — this was the bug the user flagged mid-session ("we are not even showing the icons for bottom navigation").
- **`app/src/app/(tabs)/coach.tsx`**: Send button now dims (`opacity: 0.4`) when disabled, matching the pattern already used in `exercise-list.tsx` and `quick-log-input.tsx`. Previously gave no visual feedback when input was empty.
- **`app/src/app/workout/[id].tsx`**: wired up `deleteSet` (already existed in `db/index.ts`, was never called from any screen) to `SetRow`'s `onDelete` prop — a mis-logged set can now actually be removed. Real functional gap, not cosmetic.
- **`app/src/app/_layout.tsx`**: added `headerBackButtonDisplayMode: 'minimal'` to the root Stack's `screenOptions`. Fixed an ugly literal `"(tabs)"` text appearing as the back-button label (Expo Router leaking its route-group folder name) — now just shows a clean chevron.
- **`app/package.json`**: added `@expo/vector-icons` dependency (pure JS/font asset, no native linking, works fine in Expo Go).
- **`app/eas.json`**: from earlier in the session — added `credentialsSource: "local"` for iOS builds and the `submit.production.ios` block (Apple Team ID `72CW7UW6RB`, ASC app ID `6795766755`, API key at `~/.appstoreconnect/private_keys/AuthKey_YBMFD8G6Z5.p8`).

All of the above typechecks clean (`npx tsc --noEmit` from `app/`).

## iOS — App Store Connect / TestFlight

- App: **RepLog: Workout Tracker**, App Store Connect app ID `6795766755`, bundle ID `com.nandanvarma.replog`, Apple Team ID `72CW7UW6RB`.
- **Version 1.0 page** (Distribution tab): build 3 attached, all metadata filled in (description, keywords, promotional text, privacy info published, age rating 9+, pricing $0 in 175 countries, App Review contact = Nandan / +12068373361 / nandanvarma.me@gmail.com, "Sign-in required" unchecked, notes explain the no-accounts/local-only model). **App Store Version Release is set to Manual** (per original instruction: never auto-publish). "Add for Review" button is active/enabled but was deliberately never clicked.
- **Screenshots**: 4 of 10 uploaded to the iPhone 6.5" slot — `final_home.png`, `final_library.png`, `final_workout.png`, `final_history.png` (originally captured at `/Users/nandan/.claude/jobs/962276dd/tmp/`, may not survive job cleanup — regenerate via the process below if gone). These are clean (no dev-menu artifacts), from a locally-built **Release**-configuration native app (not Expo Go — Expo Go and Debug dev-client builds both show a persistent blue gear "dev menu" bubble that had to be avoided).
- **TestFlight tab**: build 3 (buildNumber 3) already sits in the "Internal" test group, status "Ready to Submit" (this just means it hasn't been submitted for *external* Beta App Review — internal testers can already install it without any Apple review). Nandan is already a member of the Internal group from earlier setup.
- **Build 4 — DONE**: triggered via `eas build --platform ios --profile production`, build id `5f6a4aa7-57ca-415b-8575-f3d5d3757dd3`, buildNumber auto-incremented 3→4, includes all the UI fixes above. Finished on EAS, submitted via `eas submit --platform ios --profile production --id 5f6a4aa7-57ca-415b-8575-f3d5d3757dd3`, Apple processing came back `VALID`. It's now visible in TestFlight → iOS Builds, assigned to the "Internal" group automatically (that group has `hasAccessToAllBuilds: true`). Nothing further needed here.

## Android — Play Console

- App: **RepLog**, package `com.nandanvarma.replog`, Play Console developer account ID `4753874692882477780`, app ID `4974573868153617064`.
- **Store listing** (Store presence → Store listings → Default): 10 of 11 setup-checklist items complete. Only "Set up your store listing" remains, blocked on **Phone screenshots** (needs 2-8, currently 0 actually applied — see below).
  - App name, short/full description, keywords all already filled (looked AI-generated but reasonable; a "Log your workouts" short description, full description covers local-first/AI angle).
  - **App icon was fixed this session**: replaced a generic stock "dumbbell photo" placeholder icon with the real brand icon (black square, white "H"/dumbbell glyph — same as the actual app icon) at `play-app-icon-512.png` (512×512, derived from `app/assets/images/icon.png`). Confirmed saved via a "Draft saved" toast.
  - Feature graphic still uses the original stock orange "RepLog — Your Workouts, Your Data, Your Privacy" banner — left as-is, it's reasonable marketing copy, not urgent.
  - **Phone screenshots — unresolved issue**: every screenshot uploaded to this field showed up in the media library with a "no entry" (circle-slash) icon over a blank/gray thumbnail, regardless of exact dimensions tried:
    - Original device captures: 1284×2778 (too tall, ratio 0.462, outside Play's accepted range) — legitimately rejected.
    - Padded to 1563×2778 (ratio 0.5626, just over 9:16) — still showed rejected/blank.
    - Re-rendered at exactly 1080×1920 (canonical 9:16) — **still showed the same rejected/blank thumbnail**, which suggests this may not actually be a real aspect-ratio rejection but some Play Console media-library thumbnail-rendering quirk (possibly PNG color profile, possibly just a slow/broken async thumbnail job) — never got to the bottom of it. Did NOT confirm whether these images would actually have been rejected on save, or whether the UI was just showing a stale/wrong icon.
    - If resuming this: try a hard page reload after upload+wait (was about to try this when interrupted), or try JPEG instead of PNG, or try uploading via a real browser drag-and-drop instead of the file_upload bridge tool (which might set different HTTP headers/metadata that the automation path doesn't).
  - The screenshot source images (pre-padding, clean, no dev-bubble) are the same 4 files listed in the iOS section above, captured from the same Release-build simulator.
- **Internal testing track** (Test and release → Testing → Internal testing):
  - There's a pre-existing release "1 (1.0.0)" from **May 2025** already "Available to internal testers" — this is a stale/unrelated old build, NOT the current app's code. Left in place, untouched.
  - Testers: two email lists both enabled for this track — "Friends" (3 users, pre-existing, untouched) and **"Internal Testers"** (created this session, contains `nandanvarma.me@gmail.com`).
  - A **new release draft was started** ("Create internal testing release", track id `4701345367975152065`, release id `2`) but abandoned with nothing uploaded — the Play Console tab (browser tabId `1234441528`) was left sitting on this empty draft page. Safe to resume or discard.
- **Latest Android build**: EAS build id `76772008-c6cc-4201-80a3-671af5719516` (versionCode 3, `finished`), includes the exact same code as iOS build 4 (all the UI fixes). Downloaded locally to:
  ```
  /Users/nandan/.claude/jobs/962276dd/tmp/replog-v3.aab   (77 MB)
  ```
  This path is inside a job scratch dir and may be cleaned up later — if gone, redownload from:
  ```
  https://expo.dev/artifacts/eas/8YT6whtHyTVEO3d3qYCAyFSg4_SnlTt7eUdNpvsecE8.aab
  ```
  or re-check via `npx eas-cli build:view 76772008-c6cc-4201-80a3-671af5719516`.
- **Why this wasn't uploaded automatically**: the browser automation's `file_upload` tool caps combined upload size at 10 MB per call — the 77 MB AAB can't go through that bridge. Two ways to finish this by hand:
  1. **Manual**: open the internal testing "Create new release" page, drag the AAB from `/Users/nandan/.claude/jobs/962276dd/tmp/replog-v3.aab` (or wherever it's re-downloaded to) into the dropzone, fill release notes, click through to publish.
  2. **`eas submit --platform android`**: not currently configured — `eas.json`'s `submit.production` block only has an `ios` key. Would need a Google Cloud service account with Play Console API access (Play Console → Users and permissions → API access → create/link a service account, grant it "Release manager" or similar on this app, download its JSON key), then add:
     ```json
     "submit": { "production": { "android": { "serviceAccountKeyPath": "/path/to/key.json", "track": "internal" } } }
     ```
     to `app/eas.json`, then `cd app && npx eas-cli submit --platform android --profile production --non-interactive`.

## Simulators / local state (can be discarded, informational only)

- Created an **iPhone 14 Plus Screenshot** simulator (device type matches Play/App Store's exact accepted screenshot resolution), UDID `B586DB3B-2C09-49DA-A53C-A91BAB07C36E`. Has both Expo Go and a locally-built Release-configuration copy of RepLog installed (bundle id `com.nandanvarma.replog`).
- Seeded demo data directly into its SQLite db (`Documents/SQLite/replog.db` inside container `1DB8BFD5-9111-4870-9C59-6E21AD481E7B`) for realistic screenshots: 4 workouts (one active bench-press session, one completed bench+pullups, one squats, one deadlift, spread over the past several days). Purely cosmetic seed data, not meaningful to preserve.

## Browser tabs left open

- `1234441527` — App Store Connect, TestFlight → iOS Builds page.
- `1234441528` — Play Console, abandoned "Create internal testing release" draft page.
