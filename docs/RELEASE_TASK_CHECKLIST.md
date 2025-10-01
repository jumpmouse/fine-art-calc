# Fine Art Calc — Release Task Checklist

Use this checklist to track progress for iOS, Android, and Web releases. Check items as you complete them. Items marked "WAIT" indicate waiting for a response from Apple/Google or other stakeholders.

Reference docs:
- `docs/BABY_STEPS_TESTING_PUBLISHING.md` — step-by-step baby guide
- `docs/PUBLISHING.md` — concise publishing guide
- `docs/STORE_ASSETS.md` — assets and metadata specs
- `docs/DEVELOPMENT.md` — local dev setup

---

## 0) Accounts, Tools, Environment
- [ ] Apple Developer Program active (paid)
- [ ] Access to App Store Connect
- [ ] Google Play Console active (one-time fee paid)
- [ ] EAS CLI installed (`npm i -g eas-cli`) or use `npx eas-cli`
- [ ] Logged in to EAS (`eas login` / `npx eas-cli login`) and verified with `eas whoami`
- [ ] macOS has Xcode + iOS Simulator installed
- [ ] Android Studio + SDK components installed; ADB on PATH (see `docs/DEVELOPMENT.md`)
- [ ] Local run verified: `npm run web`, `npm run ios`, `npm run android`

---

## 1) Project Configuration
- [ ] Confirm iOS bundle id in `app.json > expo.ios.bundleIdentifier` (current: `com.fineartcalc.app`)
- [ ] Confirm Android package in `app.json > expo.android.package` (current: `com.fineartcalc.app`)
- [ ] Confirm app display name in `app.json > expo.name` (current: `Fine Art Calc`)
- [ ] Set versions for release:
  - [ ] `app/json > expo.version`
  - [ ] `app.json > expo.ios.buildNumber` (increment string)
  - [ ] `app.json > expo.android.versionCode` (increment integer)
- [ ] Commit all changes before builds

---

## 2) Store Assets & Metadata (see `docs/STORE_ASSETS.md`)
- [ ] Icons and splash images in `assets/` (already present)
- [ ] iOS screenshots captured (all required sizes or modern auto-scaling set)
- [ ] Android screenshots captured (phone + 7"/10" tablet recommended)
- [ ] Google Play feature graphic prepared
- [ ] App name and subtitle finalized
- [ ] Primary category chosen (iOS) / Application type + category (Android)
- [ ] Short description (Play) / Subtitle (iOS)
- [ ] Full description (both stores)
- [ ] Keywords (iOS)
- [ ] Support URL and Marketing URL
- [ ] Privacy Policy URL (if applicable). App collects no data; policy can state "No data collected".
- [ ] Age/Content rating questionnaires completed

- [ ] WAIT: Internal confirmation of marketing copy, keywords, links

---

## 3) iOS: App Store Connect setup
- [ ] App created in App Store Connect with exact bundle ID
- [ ] Pricing and availability set
- [ ] App Privacy: Data collection = None (verify behavior)
- [ ] Build a production artifact:
```bash
npx eas-cli build -p ios --profile production
```
- [ ] Submit the latest build to App Store Connect:
```bash
npx eas-cli submit -p ios --latest
```
- [ ] WAIT: Apple processing of build (10–60 min)
- [ ] Add internal testers in TestFlight (optional)
- [ ] Upload screenshots and fill metadata in App Store Connect
- [ ] Submit for review
- [ ] WAIT: Apple review outcome (typical 1–3 business days)
- [ ] If rejected, address feedback and resubmit
- [ ] On approval, release to the store

---

## 4) Android: Google Play Console setup
- [ ] App created with exact package name
- [ ] Data Safety form completed (likely "No data collected")
- [ ] Content rating completed
- [ ] Build a production artifact (AAB):
```bash
npx eas-cli build -p android --profile production
```
- [ ] Submit latest build to Play Console:
```bash
npx eas-cli submit -p android --latest
```
- [ ] Prepare store listing: descriptions, screenshots, feature graphic
- [ ] Choose track: Internal testing → Closed testing → Production
- [ ] Rollout submitted
- [ ] WAIT: Google processing of build (minutes to hours)
- [ ] WAIT: Google review outcome (hours to days)
- [ ] If rejected, address feedback and resubmit
- [ ] On approval, release to production

---

## 5) Web (optional)
- [ ] Export static site:
```bash
npx expo export --platform web
```
- [ ] Deploy `dist/` to Netlify/Vercel/GitHub Pages
- [ ] After mobile apps are live, update `app.json > expo.extra.appStoreUrl` and `playStoreUrl`
- [ ] Re-export and redeploy the web to show live store links

---

## 6) Post‑Launch
- [ ] Verify live store pages and download/install on devices
- [ ] Monitor crash logs/feedback (App Store Connect / Play Console)
- [ ] Tag a git release (e.g., `v1.0.0`)
- [ ] Prepare next version bump:
  - [ ] `expo.version`
  - [ ] `ios.buildNumber`
  - [ ] `android.versionCode`

---

## 7) Credentials & Backups
- [ ] Save EAS-managed Android keystore credentials in a secure vault
- [ ] Save Apple signing assets if self-managed
- [ ] Document who has access to Apple/Google/EAS

---

## 8) Internal Decisions (WAIT for confirmation)
- [ ] WAIT: Final app name and subtitle (store-facing)
- [ ] WAIT: Category selection (iOS + Android)
- [ ] WAIT: Pricing tier (free/paid)
- [ ] WAIT: Support URL, Marketing URL, Privacy Policy URL
- [ ] WAIT: Locales to support on the store listing (SR/EN or EN-only to start)

---

## Quick Reference
- Build profiles in `eas.json` (we use `production`) 
- App config in `app.json`
- Main app component: `App.tsx`

Keep this checklist in sync with actual store states as you progress.
