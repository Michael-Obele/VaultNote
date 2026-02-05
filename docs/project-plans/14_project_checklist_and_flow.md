# VaultNote: Project Checklist and Development Flow

This document provides a sequential checklist for building the VaultNote application. Follow these phases and steps in order to ensure a structured, logical development process that aligns with our established project plan.

---

## Phase 1: Project Setup & Foundation

**Goal:** Establish the project skeleton, configure tooling, and create the basic application layout.

-   [x] **1. Initialize Project:**
    -   [x] Create a new Tauri project with the SvelteKit (TypeScript) template.
    -   [x] Ensure the project is configured for Svelte 5 (Runes mode).

-   [x] **2. Setup Styling:**
    -   [x] Integrate Tailwind CSS following the official SvelteKit guide.
    -   [x] Initialize `shadcn-svelte`.

-   [x] **3. Add UI Components:**
    -   [x] Run the `shadcn-svelte` `add` command to bring in all the required components at once, as outlined in `11_shadcn_svelte_components.md`.
        ```bash
        npx shadcn-svelte@latest add button card checkbox dialog input label scroll-area select separator slider sonner switch tabs textarea
        ```

-   [ ] **4. Structure Frontend:**
    -   [ ] Create the folder structure inside `src/lib/` as defined in `07_best_practices.md` (`components/editor`, `components/clipboard`, etc.).
    -   [ ] Create the main application layout in `src/routes/+layout.svelte` using `shadcn-svelte` components for the overall structure (e.g., sidebar and main content area).
    -   [ ] Create the basic page files for routing:
        -   `src/routes/+page.svelte` (for the Markdown Editor)
        -   `src/routes/clipboard/+page.svelte`
        -   `src/routes/passwords/+page.svelte`
        -   `src/routes/settings/+page.svelte`
    -   [ ] Implement the main navigation (e.g., using `Tabs` or a custom sidebar) to switch between these routes.

-   [ ] **5. Configure Tauri:**
    -   [ ] Open `tauri.conf.json`.
    -   [ ] Define a strict API `allowlist`, starting with the minimum necessary for the first feature (e.g., `fs`, `path`, `window`).

---

## Phase 2: Feature 1 - Markdown Editor (MVP)

**Goal:** Implement the core note-taking functionality and establish the primary frontend-backend communication pattern.

-   [ ] **1. Setup Rust Backend:**
    -   [ ] Add the `pulldown-cmark` crate to `Cargo.toml`.
    -   [ ] In `src-tauri/src/`, create a new module (e.g., `editor.rs`).
    -   [ ] Implement and export the `parse_markdown`, `save_note`, and `load_note` Tauri commands from this module.
    -   [ ] Define custom serializable error types for file operations.
    -   [ ] Register the commands in `main.rs`.

-   [ ] **2. Build Svelte Frontend:**
    -   [ ] In `src/routes/+page.svelte`, build the main view for the editor.
    -   [ ] Create the `MarkdownEditor.svelte` and `PreviewPane.svelte` components.
    -   [ ] Use `$state` to hold the raw markdown input text.
    -   [ ] Use `$derived` to compute the HTML preview by calling the `parse_markdown` command.
    -   [ ] Implement an "autosave" feature using a debounced `$effect`. This effect will call the `save_note` command whenever the markdown input changes after a short delay.
    -   [ ] Add buttons with `onclick` handlers to manually save and load notes.

---

## Phase 3: Feature 2 - Clipboard Manager (MVP)

**Goal:** Introduce background tasks and real-time, backend-driven UI updates.

-   [ ] **1. Setup Rust Backend:**
    -   [ ] Add the `arboard` crate to `Cargo.toml`.
    -   [ ] Create a new module (e.g., `clipboard.rs`).
    -   [ ] Implement the Tauri-managed state (`Mutex<VecDeque<String>>`) for the clipboard history.
    -   [ ] Create a background thread (spawned once at startup) that periodically polls the clipboard.
    -   [ ] If a new, unique item is detected, add it to the state and emit a `clipboard-updated` event to the frontend.
    -   [ ] Implement and register the `get_clipboard_history` and `set_clipboard_content` commands.

-   [ ] **2. Build Svelte Frontend:**
    -   [ ] In `src/routes/clipboard/+page.svelte`, build the view for the clipboard manager.
    -   [ ] Create the `ClipboardItem.svelte` component. It should accept props for the content and an `onInsert` callback.
    -   [ ] In the main view, use `$state` to store the clipboard history array.
    -   [ ] Use `$effect` to subscribe to the `clipboard-updated` event from Tauri. The effect's teardown function must unsubscribe from the listener. When an event is received, update the state variable.
    -   [ ] Implement `onclick` handlers on `ClipboardItem` to copy text back to the clipboard or call the `onInsert` prop.

---

## Phase 4: Feature 3 - Password Vault (MVP)

**Goal:** Implement the most security-critical part of the application, focusing on robust cryptography and state management.

-   [ ] **1. Setup Rust Backend:**
    -   [ ] Add the `ring` and `argon2` crates to `Cargo.toml`.
    -   [ ] Create a new module (e.g., `vault.rs`).
    -   [ ] Implement the entire cryptographic flow: master password hashing/verification, key derivation, and AES-256-GCM encryption/decryption.
    -   [ ] Implement all Tauri commands as specified in the plan (`setup_vault`, `unlock_vault`, `save_password`, etc.).
    -   [ ] **Crucially, write unit tests for the encryption and decryption logic to verify its correctness.**

-   [ ] **2. Build Svelte Frontend:**
    -   [ ] In `src/routes/passwords/+page.svelte`, build the main view.
    -   [ ] Create the necessary components: `UnlockForm`, `PasswordGenerator`, `PasswordListView`.
    -   [ ] Use a single `$state` object to manage the vault's UI state (e.g., `let vault = $state({ locked: true, entries: [] })`).
    -   [ ] Use conditional rendering (`{#if vault.locked}`) to show either the `UnlockForm` or the main vault interface.
    -   [ ] Wire up all forms and buttons to their respective Tauri commands.

---

## Phase 5: Settings & Final Polish

**Goal:** Add user configuration options and refine the overall user experience.

-   [ ] **1. Setup Rust Backend:**
    -   [ ] Add `serde` and `serde_json` to `Cargo.toml`.
    -   [ ] Create a `settings.rs` module.
    -   [ ] Define the `AppSettings` struct.
    -   [ ] Implement `get_settings` and `update_settings` commands to handle reading/writing the settings from a JSON file in the app's config directory.

-   [ ] **2. Build Svelte Frontend:**
    -   [ ] In `src/routes/settings/+page.svelte`, build the settings UI.
    -   [ ] Use `$state` to hold the reactive settings object.
    -   [ ] Use `bind:` on `shadcn-svelte` components (`Switch`, `Slider`, etc.) to connect them to the properties of the reactive settings object.
    -   [ ] Add a "Save" button to persist the changes via the Tauri command.

-   [ ] **3. Polish UX:**
    -   [ ] Implement `Sonner` to provide feedback for actions like "Password copied" or "Note saved".
    -   [ ] Add `Tooltip` components to icon buttons for clarity.
    -   [ ] Review the application for a consistent and intuitive user flow.

---

## Phase 6: Final Review & Distribution

**Goal:** Ensure the application is stable, documented, and ready for use.

-   [ ] **1. Code Review:**
    -   [ ] Review all code against `07_best_practices.md` and `13_svelte_5_best_practices.md`.
    -   [ ] Remove any remaining anti-patterns or legacy code.
-   [ ] **2. Security Audit:**
    -   [ ] Run `cargo audit` and `npm audit` to check for known vulnerabilities.
-   [ ] **3. Documentation:**
    -   [ ] Update the main `README.md` with instructions on how to build and run the project.
    -   [ ] Add `rustdoc` comments to public Rust functions and JSDoc to Svelte components where necessary.
-   [ ] **4. Build and Test:**
    -   [ ] Run `cargo tauri build` to create a distributable application bundle.
    -   [ ] Test the final application on the target platform(s).
