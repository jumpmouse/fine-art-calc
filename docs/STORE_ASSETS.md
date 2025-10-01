# Store Assets & Metadata Checklist

Prepare these before submitting to stores.

## App Identity
- **App Name**: Fine Art Calc – Frame Calculator
- **Bundle ID (iOS)**: com.yourcompany.fineartcalc
- **Package (Android)**: com.yourcompany.fineartcalc
- **Support URL**: Public page (site or GitHub Pages)
- **Marketing URL**: Landing page (optional)
- **Privacy Policy URL**: Simple static page (no data collected)

## Icons & Splash
- **App Icon** (store listing): 1024×1024 PNG, no transparency (Apple requirement)
- **In-app icon**: Provided via `assets/icon.png`
- **Splash**: Single SVG/PNG is fine; keep contrast high, light background

### Web PWA Icons (site install)
Place these files for the PWA in the `public/` directory:

```
public/
  icons/
    icon-192.png              # 192×192 PNG (purpose: any)
    icon-512.png              # 512×512 PNG (purpose: any)
    icon-192-maskable.png     # 192×192 PNG (purpose: maskable)
    icon-512-maskable.png     # 512×512 PNG (purpose: maskable)
  apple-touch-icon.png        # 180×180 PNG for iOS Add to Home Screen
```

- Keep critical artwork within a safe area (maskable icons are cropped by various shapes).
- Colors used by the manifest: `theme_color` and `background_color` (see `public/manifest.json`).
- Favicon: `app.json > web.favicon` points to `./assets/favicon.png`, which Expo converts to `/favicon.ico` on export. You can override by adding `public/favicon.ico`.

## iOS Screenshots (App Store)
- Provide for the largest device size at minimum; Apple can scale down.
- Recommended sets:
  - iPhone 6.7" (e.g., 1290×2796)
  - iPhone 6.5" (e.g., 1284×2778)
  - iPad Pro 12.9" (optional)
- Formats: PNG or JPEG
- Content: Show input form and summary/export views.

## Android Screenshots (Play Store)
- At least 2 screenshots; more recommended.
- Suggested: 1080×1920 (portrait) or 1920×1080 (landscape)
- **Feature Graphic**: 1024×500 PNG/JPG (no alpha)

## Descriptions
- **Short Description (Play)**: up to 80 chars
  - Example: "Measure frames and costs for paintings. Export as PDF or image."
- **Full Description**: up to 4000 chars; include features and benefits.
- **Keywords (iOS)**: include "frame calculator, paspartu, gallery, art, framing"

## Compliance & Content
- **Age rating**: 4+ / Everyone
- **Data Safety (Android)**: No data collected (if applicable)
- **App Privacy (iOS)**: Describe no collection
- **Copyright**: Your company name, year

## Tips
- Use consistent, minimal pastel visual style across screenshots.
- Include one screenshot showing the exported PDF preview if possible.
- Validate all assets meet the latest store size rules before upload.
