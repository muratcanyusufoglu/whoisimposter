# App Store Metadata

This directory contains all App Store Connect and Google Play Store metadata.
Copy/paste from these files when creating/updating the app listings.

## Structure

```
store-metadata/
  ios/
    en/          — English (primary)
    tr/          — Turkish
    de/          — German
    fr/          — French
    es/          — Spanish
    pt/          — Portuguese
    ru/          — Russian
    it/          — Italian
    nl/          — Dutch
    ar/          — Arabic
  android/
    en/
    tr/
    ... (same structure)
  screenshots/
    ios/         — 6.7" + 5.5" + 12.9" iPad (Simulator screenshots)
    android/     — Phone + 10" tablet
```

## Field Limits (iOS)
- Name: 30 chars
- Subtitle: 30 chars
- Description: 4000 chars
- Keywords: 100 chars (comma-separated, no spaces after commas)
- Promotional Text: 170 chars (can be updated without new build)

## Field Limits (Android)
- Title: 30 chars
- Short Description: 80 chars
- Full Description: 4000 chars

## EAS Submit Config
Update `eas.json` `submit.production.ios` with real credentials before submitting.
