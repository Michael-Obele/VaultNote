# Android Build Naming Fix

## Problem

The Android APK and AAB files were being generated with generic names like:

- `app-universal-release.apk`
- `app-universal-release.aab`

While desktop builds had proper names like:

- `vaultnote_0.20.8_amd64.deb`
- `VaultNote_0.20.8_x64.dmg`

## Solution

Implemented a solution to fix Android APK build naming:

### 1. Configuration Updates

- Updated `src-tauri/tauri.conf.json` to use "VaultNote" as productName
- Created `src-tauri/tauri.android.conf.json` for Android-specific configuration

### 2. Build Script

Created `scripts/customize-android-naming.sh` that:

- Modifies the generated Android `build.gradle.kts` file
- Adds robust APK naming configuration using public Android Gradle APIs
- Uses safe casting to `com.android.build.gradle.api.ApkVariantOutput` instead of internal APIs
- Protects against null version names with fallback to "1.0"
- Handles ABI/density splits with unique naming to prevent collisions
- Uses the pattern: `VaultNote_{version}_{splits}_universal-{buildType}.apk`

### 3. GitHub Actions Integration

Updated `.github/workflows/release.yml` to:

- Run the naming customization script before Android build
- Upload files with the appropriate naming patterns

## Result

Android APK builds will now generate files with names like:

- `VaultNote_0.20.8_universal-release.apk` (instead of `app-universal-release.apk`)

AAB files will retain the default naming:

- `app-universal-release.aab` (AAB naming customization was removed due to Android Gradle API limitations)

This partially addresses the desktop build naming convention and makes it easier to identify VaultNote APK releases.

## Files Changed

1. `src-tauri/tauri.conf.json` - Updated productName
2. `src-tauri/tauri.android.conf.json` - Created Android-specific config
3. `scripts/customize-android-naming.sh` - Created build customization script
4. `.github/workflows/release.yml` - Integrated script into CI/CD
5. `src-tauri/gen/android/app/build.gradle.kts` - Modified with custom naming (generated)

## Next Release

The next release will automatically use the new naming convention for Android builds.
