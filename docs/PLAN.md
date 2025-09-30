# Fine Art Calc – Architecture & Implementation Plan

## Goals
- **[Single codebase]** Android, iOS, and Web using Expo + React Native.
- **[Core UX]** Minimal calculator: image size, optional paspartu, required frame 1, optional frame 2; lengths and costs per layer; export summary as image/PDF.
- **[No backend]** All offline. Share via system share sheet or download on web.
- **[Publish-ready]** Clear configuration and docs for App Store / Play Store publishing.

## Stack & Rationale
- **Expo SDK 54**: Stable, supports native + web.
- **React Native**: Shared UI across platforms.
- **react-native-view-shot**: Rasterize summary card to PNG for image/PDF export.
- **expo-print**: Native PDF creation.
- **expo-file-system + expo-sharing**: Save and share exports.
- **jsPDF (web)**: In-browser PDF creation.

## Data Model (UI State)
- `imgWidthCm`, `imgHeightCm`: painting size.
- `paspartuEnabled`, `paspartuWidthCm`, `pricePaspartu`.
- `frame1WidthCm`, `priceFrame1` (required width > 0).
- `frame2Enabled`, `frame2WidthCm`, `priceFrame2`.
- Derived `results: LayerResult[]` with per-layer outer size, length, line total; `grandTotal`.

## Calculation
- Start from painting size `W × H` (cm).
- For each enabled layer with width `t` (cm):
  - `outerW = prevW + 2t`, `outerH = prevH + 2t`.
  - `lengthCm = 2 × (outerW + outerH)`; `lengthM = lengthCm / 100`.
  - Perimeter reflects full linear length including 45° miters; no need to add extra waste.
- Multiply `lengthM × pricePerM` for line totals; sum for grand total.

## UI/UX
- **Single screen** with sections:
  - Painting dimensions.
  - Layers: Paspartu (toggle + width + price), Frame 1 (required), Frame 2 (toggle + width + price).
  - Summary table: item, outer size, length, price/m, line total; grand total.
  - Actions: Export Image, Export PDF.
- **Design**: light, minimal, soft-pastel accents; accessible font sizes; large tap targets.
- **Web-only banner**: Store links pulled from `app.json > expo.extra`.

## Platform-specific Behavior
- **Export Image**: RN ViewShot → PNG → Share (native) or download (web).
- **Export PDF**:
  - Native: render PNG into HTML, `expo-print` → PDF → Share.
  - Web: `jsPDF`, insert PNG into an A4 page and `save()`.

## Compatibility
- Android: 6.0+ (API 23). Expo defaults generally target modern minimums while supporting older devices.
- iOS: Expo-managed target (typically iOS 13+). Avoid forcing higher targets via plugins.

## Error Handling & Validation
- Require painting width/height and frame 1 width before enabling export.
- Sanitize decimals: accept comma or dot.
- Guard platform-only code paths (e.g., `document` on web).

## Testing & QA Checklist
- Inputs accept decimals with comma and dot.
- Toggles recalc correctly.
- Prices update line totals and grand total live.
- Export Image works on iOS, Android, Web.
- Export PDF works on iOS, Android, Web.
- Web banner hidden on mobile.

## Future Enhancements (Optional)
- Persist last-used inputs locally.
- Localization and currency formatting.
- Presets for common frame widths/prices.
- Dark mode.
