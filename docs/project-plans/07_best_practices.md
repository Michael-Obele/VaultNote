# Project Best Practices

Adhering to a set of best practices is crucial for building a high-quality, maintainable, and secure application. This document outlines the key principles to follow throughout the development of VaultNote.

## 1. Modular and Organized Code

A clean codebase is easier to understand, debug, and extend. We will enforce modularity in both the backend and frontend.

-   **Rust Backend (`src/`)**:
    -   Organize core logic into separate modules. This isolates concerns and clarifies the responsibility of each part of the codebase.
    -   **Proposed Structure**:
        ```
        src/
        ├── core/
        │   ├── mod.rs
        │   ├── editor.rs       // Markdown editor logic
        │   ├── clipboard.rs    // Clipboard monitoring logic
        │   ├── vault.rs        // Password vault logic
        │   └── settings.rs     // Settings management
        ├── models.rs           // Shared data structures (structs, enums)
        ├── state.rs            // Tauri state management structs
        └── main.rs             // Application entrypoint and command definitions
        ```

-   **SvelteKit Frontend (`src/lib/`)**:
    -   Group components, stores, and utilities by feature. This makes it easy to find all related frontend code.
    -   **Proposed Structure**:
        ```
        src/lib/
        ├── components/
        │   ├── editor/
        │   ├── clipboard/
        │   ├── vault/
        │   └── shared/         // Reusable components like buttons, modals
        ├── stores/
        │   ├── settings.js
        │   └── app.js          // General app state
        ├── utils/
        │   └── index.js
        └── services/
            └── tauri.js        // Wrapper functions for Tauri commands
        ```

## 2. Comprehensive Testing

Testing is non-negotiable for the critical parts of the application, especially those related to security and data integrity.

-   **Backend Unit Tests**: Use Rust's integrated testing framework (`#[cfg(test)] mod tests { ... }`).
    -   **What to Test**:
        -   **Cryptography**: Test that a piece of data can be encrypted and then decrypted back to its original form using the correct key.
        -   **State Logic**: Verify that the password vault correctly transitions between `Locked` and `Unlocked` states.
        -   **Data Handling**: Test functions that manipulate notes or clipboard history.
        -   **Error Conditions**: Ensure that functions return the expected errors for invalid inputs (e.g., wrong password).
-   **No `unwrap()` in Production Code**: Use `unwrap()` or `expect()` only in tests or for genuinely unrecoverable states during startup. All other fallible operations must be handled with `Result` or `Option`.

## 3. Clear and Consistent Documentation

Code should be understandable to other developers and to our future selves.

-   **Rust Backend**: Use `rustdoc` comments.
    -   `///` for documenting public functions, structs, and enums. Explain what the item does, its parameters, and what it returns.
    -   `//!` for documenting modules as a whole in `mod.rs` files.
-   **SvelteKit Frontend**: Use JSDoc comments for components and functions, explaining props, events, and logic.
-   **README.md**: Maintain a clear `README.md` with project goals, setup instructions, and usage guidelines.

## 4. Focus on User Experience (UX)

The application should be intuitive and provide clear feedback to the user.

-   **Visual Feedback**:
    -   Use loading indicators (spinners) for any asynchronous operation that might take time.
    -   Provide clear save status indicators (e.g., "Saving..." -> "Saved" or a checkmark).
    -   Display non-technical, user-friendly error messages.
-   **Consistency**: Use a consistent design system (`shadcn-svelte`) for all UI elements to create a cohesive look and feel.
-   **Responsiveness**: Ensure the UI does not freeze during heavy operations by offloading work to the Rust backend and using `async` functions.

## 5. Security by Design

Security must be a primary consideration at every step, not an afterthought.

-   **Strict Tauri Allowlist**: In `tauri.conf.json`, enable only the API endpoints that are absolutely necessary for the application to function.
-   **Scoped File System Access**: Configure the `fs` scope to only allow access to the application's data and config directories. Do not allow broad access to the user's file system.
-   **Principle of Least Privilege**: The Rust backend should not trust any data coming from the frontend. Validate and sanitize all inputs.
-   **Regular Dependency Audits**: Frequently run `cargo audit` for the backend and `npm audit` for the frontend to find and fix known vulnerabilities.
-   **Secure Data Handling**:
    -   Sensitive data (like decryption keys) should only live in memory and for the shortest time necessary.
    -   Wipe copied passwords from the system clipboard after a short, user-configurable timeout.

## 6. Performance Optimization

A performant application feels responsive and professional.

-   **Debounce Expensive Operations**: For the live markdown preview, debounce the user's input so the `parse_markdown` command isn't called on every single keystroke.
-   **Asynchronous Everywhere**: All Tauri commands that perform I/O (file access) or are CPU-intensive (cryptography) must be `async`.
-   **Lazy Loading**: If the application grows, consider lazy loading components or data that are not needed immediately on startup.

## 7. Robust Error Handling

Graceful error handling improves both stability and user experience.

-   **Custom Error Types**: In Rust, define custom error `enums` that derive `serde::Serialize`.
    ```rust
    #[derive(serde::Serialize, Debug)]
    pub enum VaultError {
        InvalidPassword,
        DecryptionFailed,
        ItemNotFound,
    }
    ```
-   **Structured Error Propagation**: Return these custom errors from your Tauri commands. This allows the frontend to receive a structured error object (e.g., `{ error: "InvalidPassword" }`) and react accordingly, instead of trying to parse a simple error string.