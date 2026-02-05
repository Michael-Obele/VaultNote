# CI/CD Guide — Desktop & Mobile Build Journey (VaultNote)

Table of contents

- [Overview](#overview)
- [Quick summary of outcome](#quick-summary-of-outcome)
- [Root causes we encountered](#root-causes-we-encountered)
- [Detailed fixes and final CI flow](#detailed-fixes-and-final-ci-flow)
  - [Release job (version sync + release-please)](#release-job-version-sync---release-please)
  - [Desktop builds (publish-tauri job)](#desktop-builds-publish-tauri-job)
  - [Android build (publish-android job)](#android-build-publish-android-job)
- [How to reproduce this in a new project (step-by-step)](#how-to-reproduce-this-in-a-new-project-step-by-step)
- [Checklist & verification steps (fast-run)](#checklist--verification-steps-fast-run)
- [Troubleshooting & common failure modes](#troubleshooting--common-failure-modes)
- [References & resources](#references--resources)
- [Appendix: Useful snippets](#appendix-useful-snippets)

---

## Overview

This document records the full CI/CD journey that led to successful desktop and Android builds for VaultNote. It collects the issues we encountered, the research performed, the fixes implemented, and the final GitHub Actions configuration that works.

It is intended as a single source of truth for maintainers and for future projects so you can replicate the same steps without trial-and-error.

## Quick summary of outcome

- Desktop builds: working; automated version synchronization prevents semver validation errors.
- Android builds: working; fixed apksigner/SDK pathing, precise crate versions, keystore validation, and APK path fixes. Tauri produces signed APK/AAB artifacts directly.
- Documentation: All troubleshooting notes consolidated in `progress/`; this single guide documents the full process.

## Root causes we encountered

1. Version & semver issues

   - Release tooling (`release-please`) produced component-prefixed tags that broke semver parsing in CI when the pipeline expected vX.Y.Z.
   - Mismatched versions between NPM packages and Rust crates (e.g., `@tauri-apps/plugin-dialog`) triggered "Error `package > version` must be a semver string".

2. Android-specific environment problems
   - `apksigner` not found: build-tools not installed or not on PATH in the runner.
   - Cargo.toml used imprecise crate versions (e.g., "2"), causing Rust crate version parsing failures.
   - Keystore secrets misconfigured: base64 secret empty/invalid -> created empty keystore file in CI.
   - Workflow assumed an unsigned APK existed and tried to sign it; Tauri already produced an already-signed APK when keystore.properties is present.

## Detailed fixes and final CI flow

I'll walk through each job in the final `release.yml` and explain the fixes that made it reliable.

### Release job (version sync - release-please)

- Purpose: Run the version synchronization script, then call release-please to generate a release tag and notes.
- Key fix: Use `package.json` as the single source of truth and a `scripts/sync-versions.js` script to inject the package version into `src-tauri/Cargo.toml` before any build steps or semver validation.

What the job does (high-level):

1. Checkout repo
2. Read `package.json` version
3. Run `node scripts/sync-versions.js` to update `src-tauri/Cargo.toml`
4. Verify `package.json` and `Cargo.toml` versions match; fail early with a clear message if they don't
5. Run `googleapis/release-please-action@v4` to create a release PR or tag

Why this works

- Keeping `package.json` as the authoritative version avoids split state between Node and Rust tooling. The sync script is idempotent and easy to run locally.

### Desktop builds (publish-tauri job)

- Purpose: Build web assets, call `tauri-action` to produce native installers for macOS/Linux/Windows.
- Key changes:
  - Re-run `scripts/sync-versions.js` (safety) to ensure `Cargo.toml` is in sync for the checked-out tag
  - Use `bun install` and `bun run vite build` for deterministic web asset builds
  - Install platform system deps on Linux (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`)
  - Use `tauri-apps/tauri-action@v0` with the correct release tag and projectPath set to `src-tauri`

Why this works

- The tauri-action calls Tauri's build tooling which expects consistent versions between NPM packages and Rust crates, which the sync script ensures.

### Android build (publish-android job)

- Purpose: Build Android APK & AAB artifacts and upload them to the GitHub release.
- Key fixes implemented (all required to reach a green Android build):

1. SDK & apksigner availability

   - Use `android-actions/setup-android@v3` with explicit `packages: "tools platform-tools build-tools;34.0.0"` so build-tools (which contains `apksigner`) is installed.
   - Use `sdkmanager --install "platforms;android-34" "build-tools;34.0.0" "ndk;25.2.9519653"` as an extra install step and append `$ANDROID_SDK_ROOT/build-tools/34.0.0` to `$GITHUB_PATH` so `apksigner` is resolvable.
   - Run `which apksigner` and `apksigner --version` during the workflow to validate availability.

2. Precise Rust crate versions

   - Replace imprecise crate version like `tauri = "2"` with explicit semantic versions found on crates.io (example: `2.8.5`).
   - This prevents Cargo from erroring on version parsing and ensures deterministic builds.

3. Keystore handling and validation

   - Require `secrets.ANDROID_KEYSTORE` to be a base64-encoded keystore file. Add an early failure with a clear message if it's absent or empty.
   - Decode the secret into `vaultnote-release.keystore` and validate that the file exists and is non-empty.
   - Write a `keystore.properties` file into `src-tauri/gen/android` containing `storeFile`, `storePassword`, `keyAlias`, and `keyPassword` (pulled from secrets). This lets the Gradle build pick up signing config automatically.

4. Adapt to Tauri's signing behavior and APK path fixes

   - Tauri will produce already-signed APKs/AABs when `keystore.properties` is present. The previous workflow attempted to sign an unsigned APK (`app-universal-release-unsigned.apk`) which doesn't exist.
   - Fix paths to upload `app-universal-release.apk` and `app-universal-release.aab` from the generated output directories.
   - Remove redundant `apksigner` and `zipalign` steps (Tauri already does proper signing if configured).

5. Debugging & artifact upload
   - After `cargo tauri android build`, list the output directories to aid debugging:

```bash
ls -la src-tauri/gen/android/app/build/outputs/apk/universal/release/
ls -la src-tauri/gen/android/app/build/outputs/bundle/universalRelease/
```

- Upload the APK & AAB using `softprops/action-gh-release@v2` and point to the correct files.

Why this works

- The Angular flow depends on Gradle (via Tauri) producing signed artifacts. Ensuring that the build tools exist, the keystore is valid, and versions are precise removes the three classes of failure we saw.

## How to reproduce this in a new project (step-by-step)

Follow this checklist to avoid the same trial-and-error:

1. Choose your single source of truth for the app version — we used `package.json`.
2. Add a `scripts/sync-versions.js` that copies `package.json` version to `src-tauri/Cargo.toml`.
3. In CI, run the sync script early (before any version checks or builds) and fail fast with a clear error if versions don't match.
4. For desktop builds:
   - Ensure system deps are installed on Linux runners (libwebkit2gtk, librsvg2, etc.).
   - Build web assets (vite/rollup) using a repeatable package manager (bun, npm, pnpm) and cache node_modules/artifacts.
   - Run Tauri build (via tauri-action) for each target platform.
5. For Android builds:
   - Add `android-actions/setup-android@v3` with explicit `packages` so build-tools are installed.
   - Install `platforms;android-34` and matching `build-tools;34.0.0` via `sdkmanager` if needed and append build-tools to PATH.
   - Use stable Java 17 (`actions/setup-java@v4`) and install required NDK if you target NDK builds.
   - Ensure Rust toolchain includes Android targets and install `tauri-cli` pinned to a v2-compatible version.
   - Store keystore as a base64 secret in `secrets.ANDROID_KEYSTORE`. Add `ANDRIOD_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` as secrets as well.
   - Decode the keystore in CI, validate the file size, and write `keystore.properties` into `src-tauri/gen/android`.
   - Run `cargo tauri android build` and list outputs to confirm artifact paths.
   - Upload the signed APK/AAB artifacts that Tauri/Gradle created; do not attempt to sign an unsigned APK unless you explicitly configure Gradle to produce one.

## Checklist & verification steps (fast-run)

Local smoke test before pushing:

1. npm/bun install
2. node scripts/sync-versions.js
3. bun run vite build
4. cd src-tauri && cargo tauri build (desktop) or cargo tauri android build (android, locally requires Android SDK)

CI smoke checklist (in pipeline):

- Run `node scripts/sync-versions.js` and verify matching versions
- Verify `apksigner` presence in PATH (Android job)
- Validate keystore is non-empty after base64 decode
- List generated artifact directories and confirm expected filenames

## Troubleshooting & common failure modes

1. "Error `package > version` must be a semver string"

   - Symptoms: Tauri build fails at validation
   - Fix: Ensure NPM and Rust versions match. Use sync script. Check for bad tags from release tooling.

2. "apksigner: command not found"

   - Fix: Make sure `build-tools;<version>` is installed and `$ANDROID_SDK_ROOT/build-tools/<version>` is in $PATH.

3. Empty keystore or decode failure

   - Fix: Ensure `secrets.ANDROID_KEYSTORE` contains a base64-encoded keystore. Test locally with `base64 vaultnote-release.keystore` and put that string into GitHub Secrets.

4. Workflow signs non-existing unsigned APK
   - Fix: Tauri may already have signed the APK. Remove post-build signing steps or point them at correct files.

## References & resources

- Tauri v2 docs: https://v2.tauri.app/
- Tauri Android signing: https://v2.tauri.app/distribute/sign/android/
- android-actions/setup-android: https://github.com/android-actions/setup-android
- Crates.io: https://crates.io

## Appendix: Useful snippets

1. sync-versions.js (concept)

```js
// ...existing code...
// read package.json, write to src-tauri/Cargo.toml replacing version line
```

2. Keystore decode snippet (CI)

```bash
echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 -d > vaultnote-release.keystore
if [ ! -s vaultnote-release.keystore ]; then echo "Keystore empty"; exit 1; fi
```

3. Verify apksigner

```bash
which apksigner || echo "apksigner not found"
apksigner --version
```

---

Last updated: September 12, 2025
