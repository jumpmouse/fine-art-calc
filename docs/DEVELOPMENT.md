# Development setup

This project uses Expo (React Native) and runs on Web, iOS, and Android. Below are platform-specific prerequisites and tips.

## Prerequisites
- Node 18+ and npm
- Git
- Expo CLI (optional): `npm i -g expo-cli` (you can use `npx expo` without global install)

## Web
```bash
npm run web
# opens http://localhost:8081 (Expo dev server). Press `w` in the terminal to open the web build.
```

### Web (PWA – production build & local verify)
```bash
# Build static PWA
npm run build:web:pwa

# Serve locally for testing (one option)
npx serve -s dist
```
- Open the local URL in Chrome/Brave and check DevTools → Application:
  - Manifest is present and lists icons.
  - Service Worker `sw.js` is registered and activated.

## iOS (macOS only)
- Install Xcode from the App Store.
- Open Xcode > Settings > Locations: ensure Command Line Tools are installed.
- Install iOS Simulator (Xcode > Settings > Platforms).
- Run:
```bash
npm run ios
```

## Android
1. Install Android Studio (https://developer.android.com/studio)
2. Open Android Studio > SDK Manager and install:
   - Android SDK Platform (latest stable)
   - Android SDK Platform-Tools
   - Android SDK Build-Tools
3. Create or start an Android Virtual Device (AVD):
   - Android Studio > Device Manager > Create device > Select a phone profile and a system image (API level 34+ recommended) > Finish.
   - Start the emulator.
4. Set environment variables in your shell profile (zsh example):
```sh
# ~/.zshrc
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin"
```
Then restart the terminal or run `source ~/.zshrc`.

5. Verify adb is available:
```bash
adb version
```

6. Run the app on Android:
```bash
npm run android
# Ensure your emulator is running or a device is connected with USB debugging enabled.
```

## Troubleshooting
- If the web console shows `SafeAreaProvider` errors, ensure the app root is wrapped in `SafeAreaProvider`.
- If Android build fails with SDK missing, re-check the environment variables and installed SDK components.
- If `adb` is not found, ensure Platform-Tools are installed and on your PATH.
- For Metro caching issues:
```bash
rm -rf node_modules
npm install
# or
npx expo start -c
```

## Notes
- Export buttons may be hidden in the UI; export logic remains in `App.tsx` if you need to re-enable.
- Store links for web banner are set in `app.json > expo.extra`.
