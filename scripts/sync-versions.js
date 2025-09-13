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
    let cargoToml = fs.readFileSync(cargoTomlPath, "utf8");

    // Replace version in Cargo.toml
    cargoToml = cargoToml.replace(
      /^version\s*=\s*"[^"]*"/m,
      `version = "${version}"`
    );

    fs.writeFileSync(cargoTomlPath, cargoToml, "utf8");
    console.log(`🦀 Updated Cargo.toml version to ${version}`);

    console.log("✅ Version synchronization complete");
  } catch (error) {
    console.error("❌ Error syncing versions:", error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  syncVersions();
}

export { syncVersions };
