# What to Avoid: Common Pitfalls and Anti-Patterns

This document serves as a critical reminder of practices and shortcuts to steer clear of during the development of VaultNote. Adhering to these guidelines is essential for building a secure, stable, and maintainable application.

## 1. Security Shortcuts: The Unforgivable Mistakes

Security is the most critical aspect of this project. Taking shortcuts here is not an option.

-   **NEVER Store Plaintext Secrets**:
    -   The master password must **never** be stored on disk in any form, not even hashed without a salt. Use Argon2 to derive a key and a separate hash for verification.
    -   The derived encryption key must **only** exist in memory and should be wiped immediately when the vault is locked.
    -   User passwords and notes (if encryption is enabled) must **always** be encrypted when stored on disk.

-   **DO NOT "Roll Your Own" Cryptography**:
    -   We are not cryptographers. Do not attempt to invent your own encryption algorithms or security protocols.
    -   **Strictly** use well-vetted, industry-standard Rust crates like `ring` for encryption and `argon2` for key derivation and hashing.

-   **AVOID Broad API Permissions**:
    -   Do not enable every API in the `tauri.conf.json` `allowlist`. This is a massive security risk.
    -   Start with a minimal allowlist and only add the specific APIs you need. For file system access, scope it as narrowly as possible (e.g., only to the app's data directory).

-   **DO NOT Trust the Frontend**:
    -   Treat all data coming from the SvelteKit UI as untrusted.
    -   Sanitize and validate all inputs on the Rust backend before processing them, even if the frontend has its own validation.

## 2. Over-Complicating and Feature Creep

The goal is to build a functional and stable core product first. Adding too many features too early leads to a buggy, unfinished application.

-   **Stick to the Minimum Viable Product (MVP)**:
    -   **Markdown Editor**: Start with a simple textarea, a preview pane, and basic file operations. Avoid complex features like a full WYSIWYG editor, real-time collaboration, or embedded images in the first version.
    -   **Clipboard Manager**: Focus on text-only history that is stored in-memory. Avoid supporting images or files, and don't build a persistent, searchable database for it initially.
    -   **Password Vault**: Perfect the core loop of locking/unlocking, generating, saving, and viewing passwords. Avoid advanced features like Time-based One-Time Passwords (TOTP), custom fields, or browser integration for now.

## 3. Ignoring Errors and Creating Instability

An application that fails gracefully is trustworthy. One that crashes or loses data is not.

-   **The `unwrap()` and `expect()` Anti-Pattern**:
    -   These functions cause the program to panic (crash) if an `Option` is `None` or a `Result` is `Err`.
    -   **NEVER** use `unwrap()` or `expect()` in application logic that can fail due to external factors (e.g., file I/O, decryption). Use proper `match` or `if let` constructs to handle potential errors.
    -   Reserve `unwrap()`/`expect()` for situations where a panic is the correct behavior (e.g., a critical asset is missing at startup) or within tests.

-   **Silent Failures**:
    -   If a function returns a `Result` or `Option`, you **must** handle it. Ignoring the return value can lead to silent failures where, for example, a file write fails but the application continues as if it succeeded, leading to data loss.

-   **Vague Error Messages**:
    -   Do not just send a generic "Error" message to the frontend. Use the custom, serializable error enums (as defined in Best Practices) to provide structured information. This allows the UI to display a meaningful message to the user ("Invalid Master Password") instead of something useless ("Internal Server Error").

## 4. Unnecessary Dependencies and Application Bloat

Every dependency adds to the final binary size, increases potential security vulnerabilities, and complicates maintenance.

-   **Be Mindful of Dependencies**:
    -   Before adding a new Rust crate or npm package, ask: "Is this library well-maintained?", "Are there known security issues?", "Is it unnecessarily large for my needs?".
    -   Prefer smaller, focused libraries over large, monolithic ones if you only need a small piece of functionality.

-   **Keep the Frontend Lightweight**:
    -   Stick to `shadcn-svelte` and avoid pulling in other large UI frameworks or libraries that might conflict or add unnecessary weight. The goal is a fast, responsive application, and a lean frontend is key.
