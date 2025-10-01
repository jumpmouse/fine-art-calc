# Publishing Guide (iOS, Android, Web)

This guide walks you through preparing, building, and submitting Fine Art Calc to the Apple App Store, Google Play, and deploying the Web app.

## 0) One-time Setup
- Install EAS CLI: `npm i -g eas-cli` (or use `npx eas-cli`).
- Create an Expo account and login: `eas login`.
- Ensure Apple Developer and Google Play Developer accounts.

## 1) Project Configuration
- Update identifiers in `app.json`:
  - iOS: `expo.ios.bundleIdentifier` (e.g., `com.yourcompany.fineartcalc`)
  - Android: `expo.android.package` (e.g., `com.yourcompany.fineartcalc`)
- Update display name in `app.json > expo.name` if desired.
- Set store links in `app.json > expo.extra` after apps are live.

## 2) iOS – Build & Submit
1. Create an App Store Connect app (https://appstoreconnect.apple.com/):
   - Name: Fine Art Calc – Frame Calculator
   - Bundle ID: EXACT match with `app.json`
   - Category: e.g., Utilities or Graphics & Design
   - Pricing: choose tier; Territories: select
   - App Privacy: Data collection = None (if applicable)
2. Build with EAS:
   ```bash
   npx eas-cli build -p ios --profile production
   ```
   - EAS can manage signing automatically; follow prompts.
   - Output: .ipa accessible via Expo dashboard.
3. Submit to App Store Connect:
   ```bash
   npx eas-cli submit -p ios --latest
   ```
4. TestFlight:
   - Add internal testers; optionally external testers for beta.
5. App review:
   - Complete App Privacy details and screenshots.
   - Provide support and marketing URLs if required.

## 3) Android – Build & Submit
1. Create an app in Google Play Console (https://play.google.com/console/):
   - App name: Fine Art Calc – Frame Calculator
   - Package name: EXACT match with `app.json`
   - Category: e.g., Tools or Art & Design
   - App content: Data safety form (likely "No data collected"), content rating, target audience.
2. Build with EAS (AAB recommended):
   ```bash
   npx eas-cli build -p android --profile production
   ```
3. Submit to Google Play:
   ```bash
   npx eas-cli submit -p android --latest
   ```
4. Rollout:
   - Track: internal testing → closed testing → production.
   - Provide screenshots, feature graphic, descriptions.

## 4) Web – Build & Deploy (PWA)
- Build static PWA:
  ```bash
  npm run build:web:pwa
  ```
  - Output in `dist/`.
- Vercel settings:
  - Framework: Other
  - Build Command: `npm run build:web:pwa`
  - Output Directory: `dist`
- Alternative hosting (if not using Vercel):
  - Netlify: drag-and-drop `dist/` or connect repo; publish dir = `fine-art-calc/dist`.
  - GitHub Pages: host the contents of `dist/` on a branch (e.g., `gh-pages`).
- The site is PWA-installable after deploy: Chrome/Brave show Install UI; iPhone Safari uses Share → Add to Home Screen.
- The web build shows "Get the mobile app" links when `app.json > expo.extra` URLs are set.

## 5) Assets & Metadata
- See `docs/STORE_ASSETS.md` for a full checklist: icons, splash, screenshots, descriptions, privacy policy.

## 6) Versioning & Releases
- Bump version numbers:
  - `app.json > expo.version` (marketing version)
  - iOS `buildNumber`, Android `versionCode`
- Rebuild with EAS after any changes.

## 7) Troubleshooting
- iOS deployment target: use Expo defaults to support older iOS. Avoid forcing higher targets unless required.
- Android min SDK: Expo defaults target wide device coverage.
- Linking issues: ensure bundle identifiers match exactly between stores and `app.json`.
