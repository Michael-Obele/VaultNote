#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncVersions() {
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

    // Handle Android version synchronization
    await handleAndroidVersioning(version);

    console.log("✅ Version sync complete!");
  } catch (error) {
    console.error("❌ Error syncing versions:", error.message);
    process.exit(1);
  }
}

async function handleAndroidVersioning(version) {
  try {
    // Check if Android project exists
    const androidAppDir = path.join(__dirname, "../src-tauri/gen/android/app");
    if (!fs.existsSync(androidAppDir)) {
      console.log("🤖 Android project not found, skipping Android versioning");
      return;
    }

    // Calculate version code from semantic version
    const versionCode = calculateVersionCode(version);
    console.log(`🤖 Calculated Android version code: ${versionCode}`);

    // Generate/update tauri.properties
    const tauriPropertiesPath = path.join(androidAppDir, "tauri.properties");
    const tauriProperties = `tauri.android.versionCode=${versionCode}
tauri.android.versionName=${version}
`;

    fs.writeFileSync(tauriPropertiesPath, tauriProperties, "utf8");
    console.log(`🤖 Updated tauri.properties with Android version info`);

    // Validate tauri.android.conf.json exists and is properly configured
    const androidConfigPath = path.join(
      __dirname,
      "../src-tauri/tauri.android.conf.json"
    );
    if (fs.existsSync(androidConfigPath)) {
      const androidConfig = JSON.parse(
        fs.readFileSync(androidConfigPath, "utf8")
      );
      if (androidConfig.productName && androidConfig.identifier) {
        console.log("🤖 Android configuration validated successfully");

        // Check version linkage
        if (androidConfig.version !== "../package.json") {
          console.log(
            `⚠️  Warning: tauri.android.conf.json version is "${androidConfig.version}" instead of "../package.json"`
          );
        } else {
          console.log("🤖 Android config version linkage validated");
        }
      } else {
        console.log(
          "⚠️  Warning: tauri.android.conf.json missing required fields"
        );
      }
    } else {
      console.log("⚠️  Warning: tauri.android.conf.json not found");
    }
  } catch (error) {
    console.error("❌ Error handling Android versioning:", error.message);
    throw error;
  }
}

function calculateVersionCode(version) {
  // Convert semantic version to numeric version code
  // Strip pre-release/build metadata (e.g., "0.21.0-beta.1+build.123" -> "0.21.0")
  const cleanVersion = version.split("-")[0].split("+")[0];

  // Parse version parts safely
  const parts = cleanVersion.split(".").map((part) => {
    const num = parseInt(part, 10);
    return isNaN(num) ? 0 : num;
  });

  const major = parts[0] || 0;
  const minor = parts[1] || 0;
  const patch = parts[2] || 0;

  // Use formula: major * 10000 + minor * 100 + patch
  // e.g., "0.21.0" -> 0*10000 + 21*100 + 0 = 2100
  // This allows for versions up to 99.99.99
  return major * 10000 + minor * 100 + patch;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncVersions();
}

export { syncVersions };
