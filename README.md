# Fine Art Calc – Painting frame calculator

Single codebase for Android, iOS, and Web (Expo + React Native). Minimal, modern UI. Computes total frame lengths (including 45° miter corners) and costs per layer (Paspartu, Frame, optional Second frame).

## Features
- **[Cross-platform]** One codebase: Android, iOS, Web.
- **[Sections]** Separate cards for `Painting dimensions` and `Layers`.
- **[Gating]** `Layers` and `Summary` are disabled until both painting width and height are entered.
- **[Inputs]** Painting width/height (cm), Paspartu width (cm), Frame width (cm), optional Second frame width (cm).
- **[Global Waste/Kerf]** Optional percentage applied to all enabled layers.
- **[Calculation]** Uses each layer’s outer perimeter. Length = 2 × (outerW + outerH). 45° miter cuts are implicitly included (full linear length).
- **[Pricing]** Price per meter; auto-computed line totals + grand total.
- **[Summary]** Shows itemized table and always displays painting dimensions above the table.
- **[Store links on Web]** Web build shows App Store / Play Store links from `app.json > expo.extra`.
- **[Reset]** Small reset button next to the title clears all inputs.

Note: export functions (image/PDF) exist in code but the buttons are temporarily hidden in the UI.

## Tech Stack
- **Expo SDK 54**, React Native 0.81, React 19
- **Export**: `react-native-view-shot`, `expo-print`, `expo-file-system`, `expo-sharing`, `jspdf` (web)

## Requirements
- Node 18+ and npm
- For iOS: macOS, Xcode, iOS Simulator
- For Android: Android Studio, Android SDK, emulator or device (see `docs/DEVELOPMENT.md`)
- Expo CLI (optional): `npm i -g expo-cli` (you can use `npx expo` without global install)

## Getting Started
```bash
# from project root
npm install

npm run web

# Run on Android (emulator must be running or device connected)
npm run android

# Run on iOS (Xcode + Simulator)
npm run ios
```

### Production Web (PWA)
```bash
# Build static PWA
npm run build:web:pwa

# Serve locally for testing (one option)
npx serve -s dist
```
- Vercel settings:
  - Framework: Other
  - Build Command: `npm run build:web:pwa`
  - Output Directory: `dist`
  - See `docs/PWA_SETUP.md` for full details.

## Using the App
- **Enter** painting width and height in cm (then Layers and Summary become active).
- **Toggle** Paspartu and/or Second frame as needed. Enter each layer’s width in cm.
- **Enter** prices per meter for each enabled layer (empty price counts as 0).
- **Optionally** set Waste/Kerf to apply across enabled layers.
- **Review** line totals and grand total in Summary. Painting dimensions are shown above the table.

## Calculation Details
- For each layer, outer dimensions expand by twice the layer width.
  - Example: image 60×80, frame width 3 → outer 66×86.
- Linear length for a layer = perimeter of the outer rectangle.
- Mitered corners (45°) do not reduce linear length; full perimeter is charged.

## Web-only Store Links
- Set URLs in `app.json`:
```json
{
  "expo": {
    "extra": {
      "appStoreUrl": "https://apps.apple.com/app/idXXXXXXXXXX",
      "playStoreUrl": "https://play.google.com/store/apps/details?id=com.fineartcalc.app"
    }
  }
}
```
- The banner with links appears on Web only, hidden on mobile.

## Android APK (sideload distribution)
- Build a sideloadable APK:
```bash
npx eas-cli build -p android --profile apk
```
- Host the `.apk` at an HTTPS URL and share with recipients.
- See `docs/ANDROID_APK_DISTRIBUTION.md` and `docs/PHONE_INSTALL_NO_STORE.md`.

## OS Compatibility
- Android: minSdkVersion 23 (Android 6.0+)
- iOS: determined by Expo SDK and Apple policy (typically iOS 13+ with current SDKs). No custom plugin forcing higher targets.

## Build & Publish
- See `docs/PUBLISHING.md` for end‑to‑end steps using EAS (Expo Application Services).
- Store assets and copy decks: `docs/STORE_ASSETS.md`.

## Project Structure
```
fine-art-calc/
  App.tsx                # main UI + calculation + export
  app.json               # Expo config, ids, icons, store links
  assets/                # icons/splash
  public/                # web PWA: manifest, index.html, icons
  eas.json               # EAS build profiles
  docs/
    PLAN.md              # architecture and implementation plan
    PWA_SETUP.md         # PWA config, icons, SW, Vercel
    PUBLISHING.md        # step-by-step publishing guide
    ANDROID_APK_DISTRIBUTION.md # EAS APK build + hosting
    STORE_ASSETS.md      # assets checklist/specs
    PHONE_INSTALL_NO_STORE.md   # end-user install without stores
  package.json
  tsconfig.json
```

## Notes
- No backend/auth. All data is local and ephemeral.
- Designed to be minimalistic and clean, with soft pastel accents.
