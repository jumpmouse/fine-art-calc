# Android APK Distribution (Sideload)

This guide explains how to build an installable APK (outside Play Store) and share it.

## 1) Prerequisites
- EAS CLI installed: `npm i -g eas-cli` (or use `npx eas-cli`).
- Expo account: `npx eas-cli login`.
- Android SDK is NOT required for cloud builds, but helpful for local debugging.
- APK profile already present in `eas.json`:
```json
{
  "build": {
    "apk": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    }
  }
}
```

## 2) Build the APK
```bash
# login if needed
npx eas-cli login

# start build (cloud)
npx eas-cli build -p android --profile apk
```
- EAS will create a signed release APK. If a keystore is needed, EAS manages it and shows credentials once (save them securely).
- Wait for the build to complete; open the URL provided to download the APK.

## 3) Host the APK
- Upload the `.apk` to an HTTPS host (e.g., Vercel static file, S3, GitHub Releases, your server).
- Keep the URL stable; it will be shared with recipients.

## 4) Share and install
- Share two links with recipients:
  - Web PWA: https://fine-art-calc.vercel.app
  - Android APK: <YOUR HTTPS APK URL>
- End-user instructions: `docs/PHONE_INSTALL_NO_STORE.md` (Android section covers enabling installs from unknown sources and installing the APK).

## 5) Update the docs (optional)
- Replace the placeholder APK URL in `docs/PHONE_INSTALL_NO_STORE.md` once your link is live.

## 6) Versioning for updates
- Each time you distribute a new APK, bump Android version code in `app.json`:
```json
{
  "expo": {
    "android": { "versionCode": 2 }
  }
}
```
- Rebuild with the same command:
```bash
npx eas-cli build -p android --profile apk
```

## 7) Notes & caveats
- APK sideloading will prompt users to allow installs from unknown sources—this is expected.
- Prefer sharing links over messaging apps that don’t corrupt file downloads.
- For a wider audience, consider Play Store distribution later; the APK path is best for small, private distributions.
