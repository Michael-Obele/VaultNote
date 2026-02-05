# CI/CD Pipeline Code Time Capsule

> **Last Updated**: September 23, 2025
> **Purpose**: Complete code reference for the VaultNote CI/CD pipeline as of version 0.21.5. This serves as a time capsule of the working configuration that successfully builds and releases across 6 platforms (Windows, macOS Intel/ARM64, Linux, Android APK/AAB).

## 📋 Overview

This document contains the complete source code of all configuration files, scripts, and workflows that power the VaultNote CI/CD pipeline. These files represent the culmination of extensive troubleshooting and optimization work detailed in the companion documentation files.

### 🔗 Cross-References to Detailed Documentation

- **[Desktop Build Guide](./desktop-build-guide.md)**: Detailed explanation of the desktop build matrix, platform-specific configurations, and troubleshooting steps
- **[Android Build Guide](./android-build-guide.md)**: Comprehensive Android build process, SDK/NDK setup, signing configuration, and issue resolution
- **[Merged CI/CD Report](./merged-ci-cd-report.md)**: Unified architectural overview, lessons learned, and operational insights
- **[README](./README.md)**: Quick reference table with build times, artifact sizes, and key configuration files

## 🚀 Main CI/CD Workflow

### `.github/workflows/release.yml`

The complete GitHub Actions workflow that orchestrates version management, desktop builds, and Android builds.

```yaml
name: Release & Build Tauri

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      bump:
        description: "Force version bump type"
        required: false
        type: choice
        options: ["patch", "minor", "major"]

jobs:
  release-please:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    outputs:
      releases_created: ${{ steps.release.outputs.releases_created }}
      tag_name: ${{ steps.release.outputs.tag_name }}
    steps:
      - uses: actions/checkout@v4
      - name: Validate version parity
        run: |
          set -euo pipefail
          pkg=$(node -p "require('./package.json').version")
          # Run sync script to ensure Cargo.toml matches package.json
          node scripts/sync-versions.js
          # Now verify all are in sync
          cargo=$(sed -n 's/^version = "\(.*\)"/\1/p' src-tauri/Cargo.toml | head -n1)
          echo "package.json: $pkg"
          echo "src-tauri/Cargo.toml: $cargo"
          echo "src-tauri/tauri.conf.json: points to ../package.json"
          if [ "$pkg" != "$cargo" ]; then
            echo "Version mismatch detected between package.json and src-tauri/Cargo.toml"
            exit 1
          fi
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: ${{ secrets.RELEASE_PLEASE_TOKEN }}
          config-file: .release-please-config.json
          manifest-file: .release-please-manifest.json

  publish-tauri:
    needs: release-please
    if: ${{ needs.release-please.outputs.releases_created == 'true' }}
    permissions:
      contents: write
    strategy:
      fail-fast: false
      matrix:
        include:
          - platform: macos-latest
            args: --target aarch64-apple-darwin
          - platform: macos-latest
            args: --target x86_64-apple-darwin
          - platform: ubuntu-22.04
            args: ""
          - platform: windows-latest
            args: ""
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ needs.release-please.outputs.tag_name }}

      - name: Debug version in tauri.conf.json and Cargo.toml
        run: |
          cat src-tauri/tauri.conf.json
          cat src-tauri/Cargo.toml

      - name: Ensure versions are synchronized
        shell: bash
        run: |
          echo "Using sync-versions.js script to ensure Cargo.toml matches package.json"
          echo "Note: tauri.conf.json now uses ../package.json as version source"
          # Sync Cargo.toml with package.json version
          node scripts/sync-versions.js
          echo "Updated src-tauri/Cargo.toml:"
          sed -n '1,40p' src-tauri/Cargo.toml

      - name: Install system deps (Ubuntu)
        if: matrix.platform == 'ubuntu-22.04'
        run: |
          sudo apt-get update
          sudo apt-get install -y \
            libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - uses: dtolnay/rust-toolchain@stable
        with:
          targets: ${{ matrix.platform == 'macos-latest' && 'aarch64-apple-darwin,x86_64-apple-darwin' || '' }}

      - uses: swatinem/rust-cache@v2
        with:
          workspaces: ./src-tauri -> target

      - run: bun install

      - name: Build web assets
        env:
          VITE_LOGIN_URL: ${{ secrets.VITE_LOGIN_URL }}
        run: bun run vite build

      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VITE_LOGIN_URL: ${{ secrets.VITE_LOGIN_URL }}
        with:
          projectPath: src-tauri
          tagName: ${{ needs.release-please.outputs.tag_name }}
          releaseName: "VaultNote ${{ needs.release-please.outputs.tag_name }}"
          releaseBody: "See the assets below to download and install."
          releaseDraft: false
          prerelease: false
          args: ${{ matrix.platform == 'macos-latest' && matrix.args || '' }}

  publish-android:
    needs: release-please
    if: ${{ needs.release-please.outputs.releases_created == 'true' }}
    runs-on: ubuntu-22.04
    permissions:
      contents: write
    steps:
      - name: Checkout release tag
        uses: actions/checkout@v4
        with:
          ref: ${{ needs.release-please.outputs.tag_name }}

      - name: Debug version in tauri.conf.json and Cargo.toml
        run: |
          cat src-tauri/tauri.conf.json
          if [ -f src-tauri/tauri.android.conf.json ]; then cat src-tauri/tauri.android.conf.json; fi
          cat src-tauri/Cargo.toml

      - name: Ensure versions are synchronized
        shell: bash
        run: |
          echo "Using sync-versions.js script to ensure Cargo.toml matches package.json"
          echo "Note: tauri.conf.json now uses ../package.json as version source"
          # Sync Cargo.toml with package.json version
          node scripts/sync-versions.js
          echo "Updated src-tauri/Cargo.toml:"
          sed -n '1,40p' src-tauri/Cargo.toml

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Setup Java 17
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17

      - name: Setup Android SDK & NDK
        uses: android-actions/setup-android@v3
        with:
          packages: "tools platform-tools build-tools;34.0.0"

      - name: Install SDK / Build-tools / NDK and verify apksigner
        run: |
          sdkmanager --install "platforms;android-34" "build-tools;34.0.0" "ndk;25.2.9519653"
          # Add build-tools to PATH to ensure apksigner is available
          echo "$ANDROID_SDK_ROOT/build-tools/34.0.0" >> $GITHUB_PATH
          # Verify apksigner is available
          which apksigner || echo "apksigner not found in PATH"
          apksigner --version || echo "apksigner not executable"

      - name: Export NDK_HOME
        run: echo "NDK_HOME=$ANDROID_NDK_ROOT" >> $GITHUB_ENV

      - name: Setup Rust toolchain w/ Android targets
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: aarch64-linux-android,armv7-linux-androideabi,i686-linux-android,x86_64-linux-android

      - name: Cache Rust / Android build artifacts
        uses: swatinem/rust-cache@v2
        with:
          workspaces: ./src-tauri -> target

      - name: Install Tauri CLI
        run: cargo install tauri-cli --version '^2.0'

      - name: Debug Tauri CLI version
        run: cargo tauri --version

      - name: Install JS dependencies
        run: bun install

      - name: Build web assets for Android
        env:
          VITE_LOGIN_URL: ${{ secrets.VITE_LOGIN_URL }}
        run: bun run vite build

      - name: Decode signing keystore
        shell: bash
        run: |
          set -euo pipefail
          # Check if the secret exists and is not empty
          if [ -z "${{ secrets.ANDROID_KEYSTORE }}" ]; then
            echo "Error: ANDROID_KEYSTORE secret is empty or not set."
            echo "Please ensure the ANDROID_KEYSTORE secret is configured with a base64-encoded keystore file."
            exit 1
          fi
          # Decode the keystore
          echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 -d > vaultnote-release.keystore
          # Verify keystore was created and has content
          if [ ! -s vaultnote-release.keystore ]; then
            echo "Error: Keystore file is empty or was not created."
            echo "This usually means the base64 string in ANDROID_KEYSTORE secret is invalid."
            exit 1
          fi
          # Show keystore info for debugging (without revealing sensitive data)
          echo "Keystore file created successfully:"
          ls -la vaultnote-release.keystore
          file vaultnote-release.keystore

      - name: Write signing config
        shell: bash
        run: |
          cd src-tauri/gen/android
          {
            echo "storeFile=$GITHUB_WORKSPACE/vaultnote-release.keystore"
            echo "storePassword=${{ secrets.ANDROID_KEYSTORE_PASSWORD }}"
            echo "keyAlias=${{ secrets.ANDROID_KEY_ALIAS }}"
            echo "keyPassword=${{ secrets.ANDROID_KEY_PASSWORD }}"
          } > keystore.properties

      - name: Debug keystore.properties
        run: cat src-tauri/gen/android/keystore.properties

      - name: Build Android (APK & AAB)
        shell: bash
        env:
          VITE_LOGIN_URL: ${{ secrets.VITE_LOGIN_URL }}
        run: |
          cd src-tauri
          cargo tauri android build

      - name: List Android build outputs
        shell: bash
        run: |
          echo "Checking Android build outputs:"
          ls -la src-tauri/gen/android/app/build/outputs/apk/universal/release/ || echo "APK directory not found"
          ls -la src-tauri/gen/android/app/build/outputs/bundle/universalRelease/ || echo "AAB directory not found"

      - name: Rename Android files
        shell: bash
        run: |
          # Get version from package.json
          VERSION=$(node -p "require('./package.json').version")

          # Rename APK file
          if [ -f "src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk" ]; then
            mv "src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk" \
               "src-tauri/gen/android/app/build/outputs/apk/universal/release/vaultnote-v${VERSION}-universal.apk"
            echo "Renamed APK to: vaultnote-v${VERSION}-universal.apk"
          fi

          # Rename AAB file
          if [ -f "src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab" ]; then
            mv "src-tauri/gen/android/app/build/outputs/bundle/universalRelease/app-universal-release.aab" \
               "src-tauri/gen/android/app/build/outputs/bundle/universalRelease/vaultnote-v${VERSION}-universal.aab"
            echo "Renamed AAB to: vaultnote-v${VERSION}-universal.aab"
          fi

          # List renamed files
          echo "Final Android build outputs:"
          ls -la src-tauri/gen/android/app/build/outputs/apk/universal/release/
          ls -la src-tauri/gen/android/app/build/outputs/bundle/universalRelease/

      - name: Upload Android APK to Release
        uses: softprops/action-gh-release@v2
        if: success()
        with:
          tag_name: ${{ needs.release-please.outputs.tag_name }}
          files: |
            src-tauri/gen/android/app/build/outputs/apk/universal/release/vaultnote-*.apk

      - name: Upload Android AAB to Release
        uses: softprops/action-gh-release@v2
        if: success()
        with:
          tag_name: ${{ needs.release-please.outputs.tag_name }}
          files: |
            src-tauri/gen/android/app/build/outputs/bundle/universalRelease/vaultnote-*.aab
```

**Key Features:**

- 3-job architecture: release-please, publish-tauri (desktop matrix), publish-android
- Version synchronization validation before releases
- Matrix build strategy for 4 desktop platforms
- Comprehensive Android SDK/NDK setup with signing
- Automatic artifact renaming and upload to GitHub releases

## ⚙️ Release Automation Configuration

### `.release-please-config.json`

Configuration for automated version management and changelog generation.

```json
{
  "packages": {
    ".": {
      "release-type": "node",
      "package-name": "vaultnote",
      "changelog-sections": [
        { "type": "feat", "section": "Features", "hidden": false },
        { "type": "fix", "section": "Bug Fixes", "hidden": false },
        {
          "type": "perf",
          "section": "Performance Improvements",
          "hidden": false
        },
        { "type": "deps", "section": "Dependencies", "hidden": false },
        {
          "type": "BREAKING CHANGE",
          "section": "⚠ BREAKING CHANGES",
          "hidden": false
        }
      ],
      "extra-files": ["src-tauri/tauri.conf.json", "src-tauri/Cargo.toml"]
    }
  },
  "pull-request-title-pattern": "chore: release ${version}",
  "pull-request-header": "# VaultNote Release",
  "separate-pull-requests": false,
  "skip-github-release": false,
  "include-v-in-tag": true
}
```

**Key Features:**

- Semantic versioning with conventional commits
- Automatic updates to `tauri.conf.json` and `Cargo.toml`
- Structured changelog with categorized sections
- GitHub releases created automatically

## 🔄 Version Synchronization Script

### `scripts/sync-versions.js`

Node.js script that ensures version consistency across all configuration files.

```javascript
#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function syncVersions() {
  try {
    // Read package.json version
    const packageJsonPath = path.join(__dirname, "../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const version = packageJson.version;

    console.log(`📦 Package.json version: ${version}`);

    // Update Cargo.toml
    const cargoTomlPath = path.join(__dirname, "../src-tauri/Cargo.toml");
    let cargoContent = fs.readFileSync(cargoTomlPath, "utf8");

    // Replace version in [package] section (only first occurrence)
    const versionRegex = /^version = ".*"/m;
    const newCargoContent = cargoContent.replace(
      versionRegex,
      `version = "${version}"`
    );

    if (cargoContent !== newCargoContent) {
      fs.writeFileSync(cargoTomlPath, newCargoContent, "utf8");
      console.log(`🦀 Updated Cargo.toml to version: ${version}`);
    } else {
      console.log(`🦀 Cargo.toml already at version: ${version}`);
    }

    // Verify tauri.conf.json points to package.json
    const tauriConfigPath = path.join(
      __dirname,
      "../src-tauri/tauri.conf.json"
    );
    const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));

    if (tauriConfig.version === "../package.json") {
      console.log("⚙️  Tauri config correctly points to package.json");
    } else {
      console.log(
        `⚠️  Warning: tauri.conf.json version is "${tauriConfig.version}" instead of "../package.json"`
      );
    }

    console.log("✅ Version sync complete!");
  } catch (error) {
    console.error("❌ Error syncing versions:", error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncVersions();
}

export { syncVersions };
```

**Key Features:**

- Synchronizes `package.json` version to `Cargo.toml`
- Validates `tauri.conf.json` version reference
- Used in CI/CD pipeline and as npm script
- Prevents version drift between components

## 📦 Package Configuration

### `package.json` (Version 0.21.5)

Main package configuration with dependencies and scripts.

```json
{
  "name": "vaultnote",
  "version": "0.21.5",
  "description": "",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "dev:t": "tauri dev",
    "build": "bun run vite build && bun run tauri build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "tauri": "tauri",
    "sync-versions": "node scripts/sync-versions.js",
    "pre-commit": "bun run sync-versions",
    "pretest": "bun run sync-versions"
  },
  "license": "MIT",
  "dependencies": {
    "@cartamd/plugin-code": "^4.2.0",
    "@cartamd/plugin-slash": "^4.2.0",
    "@prisma/client": "^6.11.1",
    "@tauri-apps/api": "2.8.0",
    "@tauri-apps/plugin-dialog": "2.4.0",
    "@tauri-apps/plugin-fs": "2.4.2",
    "@tauri-apps/plugin-opener": "2.5.0",
    "@types/markdown-it": "^14.1.2",
    "@types/node": "^24.0.12",
    "carta-md": "^4.11.1",
    "dexie": "^4.0.11",
    "github-markdown-css": "^5.8.1",
    "markdown-it": "^14.1.0",
    "marked": "^16.0.0",
    "runed": "^0.29.2"
  },
  "devDependencies": {
    "@internationalized/date": "^3.8.1",
    "@lucide/svelte": "^0.515.0",
    "@sveltejs/adapter-static": "^3.0.6",
    "@sveltejs/kit": "^2.9.0",
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "@tailwindcss/forms": "^0.5.9",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.0.0",
    "@tauri-apps/cli": "^2",
    "bits-ui": "^2.8.6",
    "clsx": "^2.1.1",
    "formsnap": "^2.0.1",
    "mode-watcher": "^1.1.0",
    "prisma": "^6.11.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2",
    "vite": "^6.0.3"
  }
}
```

**Key Features:**

- Version 0.21.5 (current as of September 23, 2025)
- Bun runtime with Vite build system
- Svelte 5 with TypeScript
- Tauri 2.x for cross-platform desktop/mobile
- Version sync script integration

## 🦀 Rust/Tauri Configuration

### `src-tauri/tauri.conf.json`

Tauri application configuration.

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "vaultnote",
  "version": "../package.json",
  "identifier": "com.vaultnote.app",
  "build": {
    "beforeDevCommand": "bun run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "bun run vite build",
    "frontendDist": "../build"
  },
  "app": {
    "windows": [
      {
        "title": "vaultnote",
        "width": 1200,
        "height": 600
      }
    ],
    "security": {
      "csp": null,
      "capabilities": [
        "default",
        {
          "identifier": "path-all",
          "windows": ["*"],
          "permissions": ["core:path:default"]
        }
      ]
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
```

**Key Features:**

- Version sourced from `../package.json`
- Bun-based development workflow
- Security capabilities for file system access
- Multi-platform bundle targets

### `src-tauri/Cargo.toml`

Rust dependencies and build configuration.

```toml
[package]
name = "vaultnote"
version = "0.21.2"
description = "A Tauri App"
authors = ["you"]
license = ""
repository = ""
default-run = "vaultnote"
edition = "2021"
rust-version = "1.60"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
# The `_lib` suffix may seem redundant but it is necessary
# to make the lib name unique and wouldn't conflict with the bin name.
# This seems to be only an issue on Windows, see https://github.com/rust-lang/cargo/issues/8519
name = "vaultnote_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.4.1", features = [] }

[dependencies]
tauri = { version = "2.8.5", features = ["custom-protocol"] }
tauri-plugin-opener = "2.5.0"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
markdown = "1.0.0"
tauri-plugin-dialog = "2.4.0"
tauri-plugin-fs = "2.4.2"
```

**Key Features:**

- Tauri 2.8.5 with custom protocol support
- File system and dialog plugins
- Markdown processing capability
- Version auto-synced from package.json

## 🔐 Required GitHub Secrets

The pipeline requires the following GitHub repository secrets:

### Release Management

- `RELEASE_PLEASE_TOKEN`: GitHub token with repo access for release-please

### Android Signing

- `ANDROID_KEYSTORE`: Base64-encoded Android keystore file
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password
- `ANDROID_KEY_ALIAS`: Key alias within keystore
- `ANDROID_KEY_PASSWORD`: Key password

### Build Configuration

- `VITE_LOGIN_URL`: Application login URL for build-time injection
- `GITHUB_TOKEN`: Auto-provided by GitHub Actions

## 📊 Pipeline Performance (Current State)

| Platform    | Runner           | Output Format             | Size                 | Build Time | Success Rate |
| ----------- | ---------------- | ------------------------- | -------------------- | ---------- | ------------ |
| Windows     | `windows-latest` | `.msi`/`.exe`             | 5.09MB/3.93MB        | 5-7 min    | >95%         |
| macOS Intel | `macos-latest`   | `.dmg`                    | 5.73MB               | 5-7 min    | >95%         |
| macOS ARM64 | `macos-latest`   | `.dmg`                    | 5.63MB               | 6-8 min    | >95%         |
| Linux       | `ubuntu-22.04`   | `.AppImage`/`.deb`/`.rpm` | 79.1MB/6.24MB/6.24MB | 4-6 min    | >95%         |
| Android APK | `ubuntu-22.04`   | `.apk`                    | 43.9MB               | 10-15 min  | >95%         |
| Android AAB | `ubuntu-22.04`   | `.aab`                    | 20.9MB               | 10-15 min  | >95%         |

## 🎯 Key Achievements

This configuration represents the successful resolution of:

1. **6 Major Android Build Issues**: SDK/NDK setup, PATH management, version pinning, signing, file renaming, and dependency conflicts
2. **Version Synchronization**: Automated sync between package.json, Cargo.toml, and tauri.conf.json
3. **Cross-Platform Matrix**: Reliable builds for 6 different platforms with consistent artifact naming
4. **Automated Releases**: End-to-end release process from commit to published artifacts
5. **Security**: Proper Android signing with keystore management

## 🔗 Related Documentation

For detailed explanations of the troubleshooting, architecture decisions, and operational insights:

- **[Desktop Build Guide](./desktop-build-guide.md)**: Platform-specific build details and matrix strategy
- **[Android Build Guide](./android-build-guide.md)**: Android SDK/NDK setup and signing process
- **[Merged CI/CD Report](./merged-ci-cd-report.md)**: Architectural overview and lessons learned
- **[README](./README.md)**: Quick reference and current status

This time capsule preserves the exact working state of the VaultNote CI/CD pipeline as of September 23, 2025, providing a complete reference for future maintenance and similar implementations.
