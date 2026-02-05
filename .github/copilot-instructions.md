# VaultNote AI Coding Guidelines

## Architecture Overview

VaultNote is a Tauri desktop app with Rust backend and SvelteKit frontend. Core features: markdown editor with autosave, clipboard manager, and encrypted password vault.

- **Backend (Rust)**: Handles file I/O, clipboard monitoring, cryptography. Commands exposed via `#[tauri::command]`.
- **Frontend (SvelteKit)**: SSG with adapter-static. Uses Svelte 5 runes for reactivity.
- **Data Storage**: Notes/settings in IndexedDB (Dexie), passwords encrypted locally.
- **State Management**: Persisted state with `runed` library.
- **UI**: shadcn-svelte components with Tailwind CSS.

Key files: `src-tauri/tauri.conf.json` (Tauri config), `svelte.config.js` (adapter-static), `src/lib/db.ts` (Dexie schema).

## Development Workflows

- **Dev**: `npm run tauri dev` (runs Vite dev + Tauri).
- **Build**: `npm run build` (Vite build + Tauri build). Uses bun internally.
- **Version Sync**: Run `npm run sync-versions` before commits to align package.json and Cargo.toml versions.
- **Android Builds**: Ensure Tauri crates use exact versions (e.g., `tauri = "2.8.5"`), not "2". See `progress/ANDROID_BUILD_SOLUTION.md`.
- **Type Checking**: Always run `bun check` after editing Svelte code to catch TypeScript and Svelte template errors. Fix all errors before proceeding.

## Code Patterns

- **Tauri Commands**: Define in `src-tauri/src/main.rs`, invoke from frontend with `invoke()`. Example: file operations in `src-tauri/src/lib.rs`.
- **Svelte Components**: Use runes (`$state`, `$derived`). Persist with `PersistedState` from `runed`.
- **Recursive Components**: Import the component and reference it by name for recursion (e.g., `<Self item={child} {onSelect} level={level + 1} />`). This is the modern approach; `<svelte:self>` is now considered obsolete.
- **Encryption**: Password vault uses AES-256-GCM with Argon2-derived key. Master password never stored.
- **Clipboard Integration**: Monitor via Tauri API, store in memory/DB, integrate with editor via reactive updates.
- **File Storage**: Notes saved as `.md` in `~/.vaultnote/notes`. Restrict access to app directory.

## Conventions

- **Imports**: Use `$lib/` aliases. UI components from `$lib/components/ui/`.
- **Error Handling**: Rust uses `Result`, frontend catches Tauri invoke errors.
- **Security**: All sensitive ops in Rust backend. No Node.js server (SSG only).
- **Testing**: No formal tests yet; focus on manual testing for crypto and file ops.

Reference: `plan/01_project_overview.md` for feature details, `README.md` for setup.</content>
<filePath">.github/copilot-instructions.md
