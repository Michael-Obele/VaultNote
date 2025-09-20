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
