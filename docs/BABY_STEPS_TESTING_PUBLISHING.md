# Fine Art Calc — Baby Steps: Test & Publish (iOS, Android, Web)

This is a hand-holding guide to go from zero to published apps. It complements `docs/PUBLISHING.md`, adds more detail, and references existing files like `app.json`, `eas.json`, and `docs/DEVELOPMENT.md`.

Use this as a checklist if you’re new to Expo/EAS, Apple App Store, and Google Play.

---

## 0) Prerequisites (once)
- Install Node 18+ and npm.
- Install Git.
- Install EAS CLI: `npm i -g eas-cli` (or use `npx eas-cli`).
- Create accounts:
  - Apple Developer Program (paid, required for App Store).
  - Google Play Console (one-time fee).
- On macOS for iOS builds: install Xcode from the App Store and iOS Simulator.

Links and tips for local setup: see `docs/DEVELOPMENT.md`.

---

## 1) Get the code and run locally
From project root:
```bash
npm install

# Web (dev server)
npm run web
# Terminal: press "w" to open the web build if needed.

# iOS (Simulator must be available on macOS)
npm run ios

# Android (emulator running or device connected via USB)
npm run android
```
Android SDK env vars (zsh example) are in `docs/DEVELOPMENT.md`.

Confirm the app looks correct, and the calculator works across platforms.

---

## 2) Confirm identifiers, versions, and naming
Open `app.json`:
- iOS bundle id: `expo.ios.bundleIdentifier` (currently `com.fineartcalc.app`).
- Android package: `expo.android.package` (currently `com.fineartcalc.app`).
- App name: `expo.name` (display name). Current: "Fine Art Calc".
- Versioning for release builds:
  - Marketing version: `expo.version` (e.g., `1.0.0`).
  - iOS: `expo.ios.buildNumber` (string, increment per App Store submission).
  - Android: `expo.android.versionCode` (number, increment per Play submission).

These IDs must exactly match what you register in App Store Connect and Google Play Console.

Commit any changes before building.

---

## 3) Log in to EAS
```bash
eas login
# or
npx eas-cli login

eas whoami
```
`eas.json` already contains profiles: `development`, `preview`, `production`. We’ll use `production` for store builds.

---

## 4) iOS: Create the App in App Store Connect (once per app)
- Go to https://appstoreconnect.apple.com/ > My Apps > New App.
- Name: "Fine Art Calc – Frame Calculator" (or preferred). 
- Platform: iOS. 
- Bundle ID: EXACT match from `app.json` (`com.fineartcalc.app`).
- Category: Utilities or Graphics & Design.
- Pricing: choose tier.
- App Privacy: likely "No data collected" (verify actual behavior; the app stores nothing remotely).

You can fill screenshots and descriptions later, but the app shell must exist so submissions succeed.

---

## 5) iOS: Build with EAS
```bash
npx eas-cli build -p ios --profile production
```
- When prompted about credentials, choose letting EAS manage them unless you have existing certs.
- Wait for build to finish; artifacts (.ipa) are on the Expo dashboard.

---

## 6) iOS: Submit to App Store Connect
```bash
npx eas-cli submit -p ios --latest
```
- This uploads the latest built .ipa to App Store Connect.
- After processing, it appears in TestFlight. Add internal testers if desired.
- Complete App Privacy, screenshots, and metadata in App Store Connect before submitting for review.

---

## 7) Android: Create the App in Google Play Console (once per app)
- Go to https://play.google.com/console/ > Create app.
- App name: "Fine Art Calc – Frame Calculator".
- Package name: EXACT match from `app.json` (`com.fineartcalc.app`).
- Complete initial setup tasks: Data Safety form (likely "No data collected"), Content rating, Target audience, etc.

---

## 8) Android: Build and Submit with EAS
Build (AAB):
```bash
npx eas-cli build -p android --profile production
```
- EAS generates a keystore if you don’t have one. Save the keystore credentials securely (you’ll need it for future updates).

Submit:
```bash
npx eas-cli submit -p android --latest
```
- In Play Console, promote to internal testing, closed testing, or production. Provide listing, screenshots, and required content.

---

## 9) Store assets and metadata
Use `docs/STORE_ASSETS.md` as the source of truth for:
- App icon, splash, and adaptive icon (already under `assets/`).
- Screenshots per platform (required sizes), feature graphic (Play), promotional text, full description, keywords, support URL, marketing URL, privacy policy URL if needed.

You can stage assets in `docs/STORE_ASSETS.md` and update over time.

---

## 10) Versioning for future updates
Before each new submission:
1) Bump versions in `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": { "buildNumber": "1.0.1" },
    "android": { "versionCode": 2 }
  }
}
```
2) Rebuild and resubmit:
```bash
npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios --latest

npx eas-cli build -p android --profile production
npx eas-cli submit -p android --latest
```

---

## 11) Optional: Web build and hosting
Static export:
```bash
npx expo export --platform web
```
- Output: `dist/`.
- Deploy options:
  - Netlify: drag-and-drop `dist/` or link repo.
  - Vercel: import repo, set output dir `fine-art-calc/dist`.
  - GitHub Pages: publish `dist/` from a branch.

Web build shows store links when you set `app.json > expo.extra.appStoreUrl` and `playStoreUrl`.

---

## 12) After apps are live
- Update `app.json > expo.extra` with real store URLs. Example:
```json
{
  "expo": {
    "extra": {
      "appStoreUrl": "https://apps.apple.com/app/idYOUR_APP_ID",
      "playStoreUrl": "https://play.google.com/store/apps/details?id=com.fineartcalc.app"
    }
  }
}
```
- Rebuild the web app and redeploy if you host the web version, so the banner points to live store pages.

---

## Troubleshooting quick wins
- Bundle ID / package name mismatch: ensure exact match across `app.json` and stores.
- iOS signing issues: allow EAS to manage credentials or upload your own if you’re rotating certs.
- Android SDK errors locally: re-check `ANDROID_HOME`/`ANDROID_SDK_ROOT` and Platform-Tools on PATH (see `docs/DEVELOPMENT.md`).
- Metro cache oddities: `npx expo start -c`.
- Review rejections: verify content ratings, data safety (no collection), screenshots, and accurate descriptions.

---

## Quick commands reference
```bash
# Login
npx eas-cli login

# iOS build + submit
npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios --latest

# Android build + submit
npx eas-cli build -p android --profile production
npx eas-cli submit -p android --latest

# Web export
npx expo export --platform web
```
