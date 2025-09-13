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
if grep -q "Custom APK/AAB naming configuration" "$ANDROID_BUILD_FILE"; then
    echo "Custom naming configuration already exists in $ANDROID_BUILD_FILE"
    exit 0
fi

# Create the custom naming configuration that works with Android Gradle Plugin
NAMING_CONFIG='
  // Custom APK/AAB naming configuration
  applicationVariants.all { variant ->
    variant.outputs.all { output ->
      val buildType = variant.buildType.name
      val versionName = variant.versionName
      val customName = "'${APP_NAME}'_${versionName}_universal-${buildType}"
      
      if (output is com.android.build.gradle.internal.api.BaseVariantOutputImpl) {
        if (output.outputFile.name.endsWith(".apk")) {
          output.outputFileName = "${customName}.apk"
        }
      }
    }
    
    // Custom AAB naming for Android App Bundle
    variant.packageApplicationProvider.get().archiveFileName.set("'${APP_NAME}'_${variant.versionName}_universal-${variant.buildType.name}.aab")
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
