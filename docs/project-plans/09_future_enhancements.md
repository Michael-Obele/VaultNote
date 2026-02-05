# Future Enhancements and Long-Term Vision

This document outlines potential features and improvements that can be built upon the core foundation of VaultNote. These ideas are categorized by their scope and complexity, providing a roadmap for future development cycles after the initial version is complete and stable.

## 1. Core Feature Enhancements

These are direct improvements to the primary features of VaultNote.

### a. Markdown Editor
-   **Note Organization**:
    -   Implement a file tree or folder system to allow users to organize notes into nested directories.
    -   Add support for tagging notes with keywords.
    -   Introduce filtering and sorting options in the note list (by date, title, or tag).
-   **Note Encryption**:
    -   Provide an option for end-to-end encryption for individual notes or entire folders, using the same robust cryptography as the password vault.
-   **Richer Editing**:
    -   Add a toolbar with common markdown formatting shortcuts (bold, italic, lists, etc.).
    -   Explore a "soft WYSIWYG" mode that styles the markdown text in place.

### b. Clipboard Manager
-   **Persistent History**:
    -   Offer an option to save clipboard history to a local, encrypted SQLite database, allowing the history to persist between sessions.
-   **Advanced Management**:
    -   Implement search functionality to find specific items in the history.
    -   Allow users to "pin" or "favorite" frequently used snippets, preventing them from being automatically cleared.
-   **Support for More Content Types**:
    -   Extend the manager to handle and display images copied to the clipboard.
    -   Add smart formatting for specific text types (e.g., automatically formatting a copied URL as a markdown link).

### c. Password Vault
-   **Password Strength Meter**:
    -   Integrate a library like `zxcvbn-rs` to provide real-time feedback on the strength of passwords as they are being created.
-   **Advanced Credential Features**:
    -   Support for Time-based One-Time Passwords (TOTP) by allowing users to store a TOTP secret and view the generated codes.
    -   Allow users to add custom fields to a password entry, such as `username`, `URL`, and secure notes.
-   **Security Auditing**:
    -   Integrate with an API like "Have I Been Pwned" to check if any stored usernames or passwords have appeared in known data breaches.

## 2. Application-Wide Enhancements

These features improve the overall usability and functionality of the application.

### a. Global Search
-   Implement a unified search bar (e.g., accessible via `Ctrl+K`) that can query across all application data:
    -   Note titles and content.
    -   Password entry labels.
    -   Clipboard history (if persistence is enabled).
-   **Implementation**: This could be powered by a lightweight, full-text search library like `tantivy` running in the Rust backend to provide fast and relevant results.

### b. Keyboard Shortcuts
-   Implement comprehensive and customizable keyboard shortcuts for common actions to improve power-user efficiency.
-   **Examples**:
    -   `Ctrl+N`: Create a new note.
    -   `Ctrl+S`: Save the current note.
    -   `Ctrl+L`: Lock the password vault.
    -   `Ctrl+Shift+C`: Toggle the clipboard manager view.
    -   `Ctrl+Shift+P`: Toggle the password vault view.

### c. Data Portability (Import/Export)
-   **Export**:
    -   **Notes**: Allow users to export a single note, a folder, or all notes as a collection of `.md` files, or as a single HTML/PDF document.
    -   **Passwords**: Support exporting the vault to a standard, encrypted format like a password-protected JSON or CSV file.
-   **Import**:
    -   **Passwords**: Allow users to import credentials from plaintext CSV files exported from other password managers, with clear warnings about the insecurity of the source format.

## 3. Architectural and Long-Term Vision

These are complex, high-impact features that would represent major milestones for the project.

### a. Plugin System
-   Design and implement a plugin architecture to allow for third-party extensions.
-   **Possible Approaches**:
    -   **WASM-based**: Allow plugins to be written in any language that compiles to WebAssembly (WASM), running them in a sandboxed environment for security.
    -   **Rust-based**: Define a stable Rust API (Application Binary Interface) that plugin authors can build against.
-   **Goal**: Enable the community to add new features, such as different editor types, support for new data sources, or custom integrations.

### b. Optional Cloud Sync
-   Implement an optional, end-to-end encrypted synchronization feature.
-   **Key Principles**:
    -   **Zero-Knowledge**: All data (notes, vault, etc.) must be encrypted on the client-side *before* being transmitted. The sync server should never have access to the unencrypted data.
    -   **User-Provided Storage**: Instead of hosting our own service, the initial implementation would target user-owned storage solutions, such as:
        -   An S3-compatible object store.
        -   A WebDAV server.
        -   A private Git repository.
-   **Goal**: Allow a user to securely sync their VaultNote data across multiple devices without entrusting their plaintext data to a third-party service.