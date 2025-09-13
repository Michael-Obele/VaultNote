# Android Build Naming Fix

## Problem
The Android APK and AAB files were being generated with generic names like:
- `app-universal-release.apk`
- `app-universal-release.aab`

While desktop builds had proper names like:
- `vaultnote_0.20.8_amd64.deb`
- `VaultNote_0.20.8_x64.dmg`

## Solution
Implemented a comprehensive solution to fix Android build naming:

### 1. Configuration Updates
- Updated `src-tauri/tauri.conf.json` to use "VaultNote" as productName
- Created `src-tauri/tauri.android.conf.json` for Android-specific configuration

### 2. Build Script
Created `scripts/customize-android-naming.sh` that:
- Modifies the generated Android `build.gradle.kts` file
- Adds custom APK/AAB naming configuration
- Uses the pattern: `VaultNote_{version}_universal-{buildType}.{ext}`

### 3. GitHub Actions Integration
Updated `.github/workflows/release.yml` to:
- Run the naming customization script before Android build
- Upload files with the new naming pattern

## Result
Android builds will now generate files with proper names like:
- `VaultNote_0.20.8_universal-release.apk`
- `VaultNote_0.20.8_universal-release.aab`

This matches the desktop build naming convention and makes it easier to identify VaultNote releases.

## Files Changed
1. `src-tauri/tauri.conf.json` - Updated productName
2. `src-tauri/tauri.android.conf.json` - Created Android-specific config
3. `scripts/customize-android-naming.sh` - Created build customization script
4. `.github/workflows/release.yml` - Integrated script into CI/CD
5. `src-tauri/gen/android/app/build.gradle.kts` - Modified with custom naming (generated)

## Next Release
The next release will automatically use the new naming convention for Android builds.
