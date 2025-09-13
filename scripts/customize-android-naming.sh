#!/bin/bash

# Script to customize Android APK/AAB naming in Tauri projects
# This script modifies the generated build.gradle.kts to use custom output names

set -euo pipefail

ANDROID_BUILD_FILE="src-tauri/gen/android/app/build.gradle.kts"

if [ ! -f "$ANDROID_BUILD_FILE" ]; then
    echo "Error: Android build file not found at $ANDROID_BUILD_FILE"
    echo "Please ensure you've run 'cargo tauri android init' first"
    exit 1
fi

echo "Customizing Android APK/AAB naming in $ANDROID_BUILD_FILE"

# Get app version from package.json
APP_VERSION=$(node -p "require('./package.json').version")
APP_NAME="VaultNote"

echo "App Name: $APP_NAME"
echo "App Version: $APP_VERSION"

# Check if custom naming is already applied
if grep -q "Custom APK naming configuration" "$ANDROID_BUILD_FILE"; then
    echo "Custom naming configuration already exists in $ANDROID_BUILD_FILE"
    exit 0
fi

# Create the custom naming configuration that works with Android Gradle Plugin
NAMING_CONFIG='
  // Custom APK naming configuration using newer variant API
  // Note: Using legacy applicationVariants for compatibility with current AGP version
  // TODO: Migrate to androidComponents.onVariants when AGP version allows
  applicationVariants.all { variant ->
    variant.outputs.all outputs@{ output ->
      val buildType = variant.buildType.name
      val version = variant.versionName ?: "1.0"
      
      val apkOutput = output as? com.android.build.gradle.api.ApkVariantOutput
      apkOutput?.let {
        // Build base name
        var customName = "'${APP_NAME}'_${version}"
        
        // Append split filters for unique naming if ABI/density splits exist
        val splitFilters = it.filters
        if (splitFilters.isNotEmpty()) {
          val splitParts = splitFilters.map { filter -> "${filter.filterType}_${filter.identifier}" }
          customName += "_${splitParts.joinToString("-")}"
        } else {
          customName += "_universal"
        }
        
        customName += "-${buildType}"
        it.outputFileName = "${customName}.apk"
      }
    }
  }'

# Find the position to insert the naming configuration (after buildFeatures)
if grep -q "buildFeatures { buildConfig = true }" "$ANDROID_BUILD_FILE"; then
    # Use awk to insert the configuration at the right place
    awk -v config="$NAMING_CONFIG" '
    /buildFeatures \{ buildConfig = true \}/ {
        print $0
        print config
        next
    }
    { print }
    ' "$ANDROID_BUILD_FILE" > "${ANDROID_BUILD_FILE}.tmp"
    
    mv "${ANDROID_BUILD_FILE}.tmp" "$ANDROID_BUILD_FILE"
    echo "Successfully added custom APK/AAB naming configuration to $ANDROID_BUILD_FILE"
else
    echo "Warning: Could not find insertion point in $ANDROID_BUILD_FILE"
    echo "Please manually add the custom naming configuration"
    exit 1
fi
