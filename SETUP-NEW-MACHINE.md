# Running BotsaPay on a new machine (SDK 54 / Expo Go branch)

This branch (`downgrade-sdk-54`) runs **Expo SDK 54** so the app loads in the
public **App Store / Play Store Expo Go** by scanning a QR code. (The `main`
branch is on SDK 56, which Expo Go does **not** support on iOS yet.)

## 1. Prerequisites (install once)

- **Node.js LTS** — version 20.19+ or 22.x recommended (anything ≥ 20 works).
  Check: `node -v`
- **Git**
- **Expo Go app** on your phone, from the App Store / Play Store (this is SDK 54-compatible).
- Phone and computer on the **same Wi-Fi** (or use `--tunnel`, see below).

> You do **NOT** need Xcode or CocoaPods for the Expo Go QR workflow.
> Those are only for building a native app (see "Native build" at the bottom).

## 2. Clone and switch to this branch

```bash
git clone https://github.com/gmotlalepuo/BotsaPay-V1.git
cd BotsaPay-V1
git checkout downgrade-sdk-54
```

## 3. Install dependencies

```bash
npm install --legacy-peer-deps
```

⚠️ The `--legacy-peer-deps` flag is **required** — the SDK 54 dependency tree
has peer-dependency ranges that npm's strict resolver rejects. A plain
`npm install` may error with `ERESOLVE`.

## 4. Environment variables

The `.env` file is committed to the repo, so it's already present after cloning
(contains `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`,
`EXPO_PUBLIC_API_BASE_URL`). No action needed unless those values changed.

## 5. Start the dev server (generates the QR)

```bash
npx expo start --go
```

- A **QR code** prints in the terminal.
- iPhone: open the **Camera** app, point at the QR → tap "Open in Expo Go".
- Android: open **Expo Go** → "Scan QR code".
- First load bundles in ~20–40s.

### If phone and computer are on different networks
```bash
npx expo start --go --tunnel
```

### Useful keys while it's running
`r` reload · `c` reprint QR · `i` open iOS simulator · `?` all commands · `Ctrl+C` stop

## Troubleshooting

- **"Port 8081 in use"** → another Metro is running. Reuse it, or free it:
  `lsof -ti:8081 | xargs kill`
- **Stale bundle / weird errors** → `npx expo start --go --clear`
- **"incompatible with this version of Expo Go"** → your Expo Go isn't SDK 54.
  Update the Expo Go app, or confirm you're on the `downgrade-sdk-54` branch
  (`git branch --show-current`).
- **Sanity check the project resolves** → `npx tsc --noEmit` then `npx expo-doctor`

## Native build (optional, macOS only — NOT needed for Expo Go)

Only if you want a real native build / simulator instead of Expo Go:

```bash
# requires Xcode + CocoaPods (brew install cocoapods)
npx expo run:ios       # regenerates ios/, pod install, compiles, launches sim
```

This does not produce a QR and won't run on a physical phone without Apple
code-signing.
