# VaultNote Project Plan

## Project Overview

- **Name**: VaultNote
- **Description**: A desktop application built with Tauri (Rust) and SvelteKit (Frontend) that integrates a markdown editor with autosave, a clipboard manager, and a secure password generator and storage. It’s a productivity hub designed to streamline note-taking, snippet reuse, and credential management while serving as a learning project for Rust and Tauri.
- **Purpose**: To create a practical, secure tool that solves real-world problems and provides hands-on experience with Rust and Tauri for beginners.
- **Technologies**:
  - **Tauri**: Lightweight framework for building secure desktop apps with Rust.
  - **Rust**: Backend logic for file operations, clipboard access, and cryptography.
  - **SvelteKit**: Frontend for a reactive, user-friendly interface.

## Features

### 1. Markdown Editor with Autosave

- **Description**: A text editor supporting markdown syntax with real-time preview and automatic saving of changes to local files.
- **Implementation**:
  - **Frontend**: Create a SvelteKit component with a text area for markdown input and a preview pane for rendered output. Use reactive statements to update the preview as the user types.
  - **Backend**: Use the Rust crate `pulldown-cmark` to parse markdown into HTML. Implement file saving and loading using Tauri’s file system APIs. Autosave triggers every 5 seconds (configurable) or on events like blur or enter.
  - **Storage**: Save notes in a dedicated folder (e.g., `~/.vaultnote/notes`) as `.md` files.
- **Best Practices**:
  - Use Tauri’s command system (`#[tauri::command]`) to expose save and load functions to the frontend.
  - Restrict file access to a specific directory to enhance security.
  - Implement error handling for file operations using Rust’s `Result` type.
  - Lazy-load markdown parsing to optimize performance.
- **What to Avoid**:
  - Don’t add complex features like version control or collaboration initially.
  - Avoid saving files outside the designated directory to prevent security risks.
- **Future Plans**:
  - Support multiple notes with a list view and folder organization.
  - Add tagging and search functionality for notes.
  - Optionally encrypt notes for added security.
- **Learning Focus**:
  - **Rust**: File I/O, error handling, external crates (`pulldown-cmark`).
  - **Tauri**: File system APIs, command system.
  - **SvelteKit**: Reactive components, user input handling.

### 2. Clipboard Manager

- **Description**: Monitors the system clipboard, stores recent items, and allows users to save snippets as new notes or insert them into the current note.
- **Implementation**:
  - **Backend**: Use Tauri’s clipboard API to detect changes and store up to 10 recent items in memory or a local SQLite database.
  - **Frontend**: Build a SvelteKit sidebar component to display clipboard history with buttons for “Save as Note” or “Insert into Current Note.”
  - **Integration**: Allow clipboard content to be formatted as markdown (e.g., URLs as `[text](url)`).
- **Best Practices**:
  - Limit clipboard history size to prevent memory bloat.
  - Use Tauri’s command system to update the clipboard history securely.
  - Implement a cleanup mechanism to remove old entries.
  - Audit clipboard content to avoid storing sensitive data without user consent.
- **What to Avoid**:
  - Don’t store clipboard data indefinitely; set a maximum history size or time limit.
  - Avoid capturing sensitive data (e.g., passwords) without explicit user action.
- **Future Plans**:
  - Add filtering (e.g., show only URLs) and categorization (e.g., text, images).
  - Automatically format specific content types (e.g., URLs as markdown links).
  - Support clipboard history export as a note collection.
- **Learning Focus**:
  - **Rust**: System APIs (clipboard), data structures for history management.
  - **Tauri**: Clipboard API, command system.
  - **SvelteKit**: Dynamic lists, event handling.

### 3. Password Generator and Secure Storage

- **Description**: Generates strong, random passwords and stores them in an encrypted vault, accessible only with a master password.
- **Implementation**:
  - **Backend**: Use the `ring` crate for secure random password generation and AES-256 encryption. Derive an encryption key from the master password using Argon2. Store encrypted passwords in a local SQLite database or file.
  - **Frontend**: Create a SvelteKit component for generating passwords, saving them with labels (e.g., “GitHub”), and viewing them after entering the master password.
  - **Security**: Hash the master password with Argon2 and never store it in plain text.
- **Best Practices**:
  - Use secure random number generation (`ring::rand`) for passwords.
  - Implement robust error handling for encryption/decryption operations.
  - Separate the password vault from other data for enhanced security.
  - Use Tauri’s command system for sensitive operations.
- **What to Avoid**:
  - Never store the master password or unencrypted passwords.
  - Avoid weak encryption methods or outdated libraries.
- **Future Plans**:
  - Add password strength checking using a library like `zxcvbn`.
  - Support import/export of passwords in an encrypted format.
  - Integrate with external password managers (e.g., via CSV export).
- **Learning Focus**:
  - **Rust**: Cryptography, secure random number generation, key derivation.
  - **Tauri**: Secure storage, command system for sensitive operations.
  - **SvelteKit**: Secure form handling, conditional rendering.

### 4. Additional Features

- **Unified Interface**:
  - Design a SvelteKit layout with a markdown editor, clipboard sidebar, and password vault tab.
  - Ensure seamless navigation between features using SvelteKit routing.
- **Settings**:
  - Allow users to configure autosave intervals, clipboard history size, password generation options (e.g., length, character types), and theme (light/dark).
  - Store settings in a local JSON file via Tauri’s file system APIs.
- **Security**:
  - Follow Tauri’s security guidelines, limiting API exposure and auditing dependencies.
  - Encrypt all sensitive data (passwords, optionally notes).
- **Learning Focus**:
  - **Rust**: JSON serialization (`serde`), configuration management.
  - **Tauri**: Security best practices, configuration APIs.
  - **SvelteKit**: Routing, state management with stores.

## Learning Path

### Rust Concepts to Learn
- **Basic Syntax and Data Types**: Understand structs, enums, and basic types for building data models.
- **Ownership and Borrowing**: Master Rust’s memory management, crucial for safe coding.
- **Error Handling**: Use `Result` and `Option` for robust file and encryption operations.
- **File I/O**: Learn to read/write files for notes and settings.
- **Cryptography**: Explore secure password generation and encryption with `ring` or `rust-crypto`.
- **External Crates**: Integrate libraries like `pulldown-cmark` and `sqlite` for functionality.
- **Resources**:
  - [The Rust Book](https://doc.rust-lang.org/book/) for foundational learning.
  - [Rust by Example](https://doc.rust-lang.org/rust-by-example/) for practical examples.

### Tauri Documentation to Check
- **Getting Started Guide**: Learn setup and project structure ([Tauri Start](https://v2.tauri.app/start/)).
- **API Reference**: Focus on file system, clipboard, and dialog APIs for core functionality.
- **Security Best Practices**: Understand how to secure sensitive operations.
- **Command System**: Learn to define and invoke commands between frontend and backend.
- **Resources**:
  - [Tauri Documentation](https://v2.tauri.app/) for comprehensive guides.
  - [Tauri GitHub](https://github.com/tauri-apps/tauri) for examples and community support.

### SvelteKit Concepts to Learn
- **Component-Based Architecture**: Build reusable UI components for the editor, clipboard, and vault.
- **Reactive Statements**: Use for live markdown previews and dynamic updates.
- **Routing**: Implement if adding multiple views (e.g., note list, settings).
- **Forms and User Input**: Handle input for notes, passwords, and settings.
- **State Management**: Use Svelte stores for app-wide state (e.g., clipboard history).
- **Resources**:
  - [SvelteKit Docs](https://kit.svelte.dev/docs) for setup and tutorials.

## Best Practices

- **Modular Code**: Organize code into modules (e.g., `editor`, `clipboard`, `password`) for maintainability.
- **Testing**: Write unit tests for backend logic, especially encryption and file operations, using Rust’s testing framework.
- **Documentation**: Add inline comments and maintain a README for clarity.
- **User Experience**: Design a responsive, intuitive UI with clear feedback (e.g., save indicators).
- **Security**: Limit Tauri’s API surface, use whitelisted commands, and audit dependencies regularly.
- **Performance**: Lazy-load resources and optimize file operations for speed.
- **Error Handling**: Use custom error types with `serde::Serialize` for frontend communication.

## What to Avoid

- **Security Shortcuts**: Never store unencrypted passwords or sensitive data.
- **Overcomplicating**: Start with basic features (e.g., single note, limited clipboard history) to avoid overwhelm.
- **Ignoring Errors**: Always handle errors for file I/O, encryption, and clipboard operations.
- **Unnecessary Dependencies**: Keep the app lightweight by avoiding bloated libraries.

## Future Enhancements

- **Theming**: Add light and dark mode support for better user experience.
- **Keyboard Shortcuts**: Implement shortcuts for common actions (e.g., save, generate password).
- **Plugins**: Design a plugin system for user-extensible functionality.
- **Cross-Platform Sync**: Add optional encrypted sync via a user-provided server.
- **Search Functionality**: Enable searching across notes, clipboard history, and passwords.
- **Export/Import**: Support exporting notes as markdown/HTML and importing passwords.

## Proper Flow

1. **Launch App**: User sees a clean interface with the markdown editor, clipboard sidebar, and password vault tab.
2. **Note Taking**: User writes markdown, sees a live preview, and changes are autosaved.
3. **Clipboard Integration**: Copied items appear in the sidebar; user can save them as notes or insert into the current note.
4. **Password Management**: User accesses the vault, enters the master password, generates/saves passwords, and retrieves them as needed.

## How to Better Experience Rust and Tauri

- **Start Small**: Begin with the markdown editor to learn file I/O and Tauri’s command system.
- **Iterate Gradually**: Add the clipboard manager, then the password vault, to build confidence.
- **Focus on Rust’s Strengths**: Dive into ownership, borrowing, and memory safety to understand Rust’s unique approach.
- **Experiment with Crates**: Use `pulldown-cmark` for markdown, `ring` for cryptography, and `sqlite` for storage.
- **Leverage Tauri’s APIs**: Explore file system, clipboard, and security features to see Tauri’s power.
- **Debug Actively**: Use Rust’s debugging tools and Tauri’s logging to troubleshoot issues.
- **Engage with Community**: Check forums like Reddit’s r/rust or r/tauri_app for tips and support.

## Extended Ideas

- **Note Organization**: Add folders, tags, or a tree view for better note management.
- **Clipboard Automation**: Automatically format clipboard content (e.g., URLs as markdown links).
- **Password Categories**: Organize passwords into groups (e.g., work, personal).
- **Encryption for Notes**: Extend encryption to notes for enhanced privacy.
- **Analytics Dashboard**: Add a simple dashboard to track note creation or password usage frequency.
- **Cross-Device Backup**: Implement a secure backup system to an external drive or user-specified location.