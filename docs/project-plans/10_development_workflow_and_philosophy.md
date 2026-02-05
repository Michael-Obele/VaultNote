# Development Workflow and Philosophy

This document outlines the recommended workflow, development order, and mindset for building VaultNote. Following this plan will help ensure a smooth development process, a stable final product, and a rewarding learning experience with Rust and Tauri.

## 1. The Target User Experience: "The Proper Flow"

Before we write a line of code, we should have a clear vision of the end-user's journey. This is our target to build towards.

1.  **Launch & First Impression**: The user opens VaultNote and is greeted by a clean, unified interface. The layout is simple: a navigation rail on the side and the main content area, which defaults to the markdown editor.
2.  **Effortless Note-Taking**: The user starts typing in the markdown editor. A live preview pane updates in real-time. Without any manual action, their work is periodically autosaved, providing peace of mind.
3.  **Seamless Clipboard Integration**: While working, the user copies some text from another application. This item instantly and unobtrusively appears at the top of the clipboard history list in the VaultNote sidebar. Later, they can click that item to copy it back or insert it directly into their note.
4.  **Secure Password Management**: The user navigates to the "Passwords" tab. They are prompted to enter their master password to unlock the vault. Once unlocked, they can generate a new strong password for a website, save it with a label, and easily copy it to the clipboard when needed. After a period of inactivity, the vault locks itself automatically.

## 2. The Development Strategy: An Iterative Approach

We will not build all of this at once. The best way to manage complexity and learn effectively is to build the application feature by feature in a logical order.

### Step 1: Build the Application Skeleton
-   **Goal**: Create the basic structure of the application.
-   **Tasks**:
    -   Initialize a new Tauri project with the SvelteKit frontend template.
    -   Set up the main application layout: a permanent sidebar for navigation and a main content area.
    -   Implement the SvelteKit routing for the core views: `/`, `/clipboard`, `/passwords`, and `/settings`.
    -   Choose and integrate the `shadcn-svelte` component library.

### Step 2: Implement the Markdown Editor
-   **Goal**: Build the first core feature and master basic Tauri communication.
-   **Learning Focus**: Rust file I/O, `serde` for JSON, Tauri `Commands`, and Svelte reactivity.
-   **Tasks**:
    -   Create the Svelte components for the editor and preview pane.
    -   Write the Rust `#[tauri::command]` functions for `save_note`, `load_note`, and `parse_markdown` (using `pulldown-cmark`).
    -   Wire the frontend to call these commands.
    -   Implement the frontend logic for autosaving.

### Step 3: Add the Clipboard Manager
-   **Goal**: Introduce background tasks and backend-to-frontend communication.
-   **Learning Focus**: Rust concurrency (`std::thread`), `Mutex` for shared state, and the Tauri `Event` system.
-   **Tasks**:
    -   Create a Rust background thread that polls the clipboard for changes.
    -   Use a `Mutex<VecDeque<String>>` managed by `tauri::State` to store the history.
    -   When the history changes, have Rust `emit` an event to the frontend.
    -   Create a Svelte component that `listens` for this event and updates the UI.

### Step 4: Integrate the Password Vault
-   **Goal**: Tackle the most security-critical feature.
-   **Learning Focus**: Cryptography with the `ring` and `argon2` crates, secure data management, and careful error handling.
-   **Tasks**:
    -   Implement the entire cryptographic flow in Rust: master password verification, key derivation, and AES-256-GCM encryption/decryption.
    -   Define the secure state machine: `VaultStatus::Locked` vs. `VaultStatus::Unlocked`.
    -   Create the Svelte UI for the lock screen, password generation, and the vault view.
    -   Write and thoroughly test all Tauri commands related to the vault.

### Step 5: Develop the Settings and Polish
-   **Goal**: Add customization and refine the user experience.
-   **Tasks**:
    -   Create the `AppSettings` struct in Rust and the JSON file for storage.
    -   Build the Svelte settings page to modify and save these settings.
    -   Add keyboard shortcuts, visual feedback (like toasts for "Password Copied"), and other small UX improvements.

## 3. The Learning Philosophy: How to Succeed with Rust and Tauri

-   **Embrace the Compiler, Don't Fight It**: The Rust compiler and its borrow checker are your allies. If you get an error, the goal is not to find a workaround but to understand *why* the compiler is stopping you. This is the path to mastering Rust's core concepts of ownership and memory safety.
-   **Debug Actively**: Don't guess why something isn't working.
    -   **Backend**: Use `dbg!` and `println!` liberally during development to inspect variables and program flow.
    -   **Frontend**: Use the browser developer tools (accessible by right-clicking in the app) to inspect the console, network requests (to Tauri), and component state.
-   **Experiment with Crates**: A huge part of Rust's power comes from its ecosystem. Don't be afraid to pull in a crate to solve a problem. The process of integrating `pulldown-cmark`, `ring`, `serde`, etc., is a core part of the learning experience.
-   **Engage with the Community**: You are not alone. When you get stuck, seek help. The Rust and Tauri communities are very welcoming.
    -   Tauri Discord Server
    -   GitHub Discussions
    -   Reddit: r/rust, r/tauri_apps

By following this iterative plan and adopting this learning-focused mindset, we can successfully build VaultNote into a robust, secure, and useful application.