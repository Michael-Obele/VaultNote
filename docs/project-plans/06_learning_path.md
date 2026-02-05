# Project Learning Path: Mastering Rust, Tauri, and SvelteKit

This document outlines the specific concepts and skills to focus on for each technology used in VaultNote. The goal is to provide a structured path for learning, directly tied to the features we are building.

## 1. Rust Concepts to Master

Rust is the backbone of VaultNote, handling all core logic, security, and performance-critical tasks. A solid understanding of these concepts is essential.

### a. Foundational Concepts
- **Basic Syntax and Data Types (Structs, Enums)**
  - **Why?**: To model our application's data cleanly and safely. We will use `structs` for things like `PasswordEntry` or `AppSettings`, and `enums` for managing states like `VaultStatus::Locked` or `VaultStatus::Unlocked`.
  - **Application**: Defining data structures for notes, clipboard items, and password vault entries.

- **Ownership and Borrowing**
  - **Why?**: This is Rust's core feature for memory safety without a garbage collector. Mastering it is non-negotiable for writing correct, efficient, and safe Rust code.
  - **Application**: Everywhere. It will influence how data is passed to and from functions, especially in the context of Tauri commands.

- **Error Handling (`Result` and `Option`)**
  - **Why?**: To build a robust application that doesn't crash. Rust's explicit error handling ensures we gracefully manage issues like file-not-found, permission errors, or decryption failures.
  - **Application**: In all functions that can fail, especially file I/O, cryptographic operations, and API calls.

### b. Applied Concepts for VaultNote
- **File I/O (`std::fs`)**
  - **Why?**: To save and load user data.
  - **Application**: Reading and writing markdown files for the editor, and the `settings.json` and `vault.dat` files.

- **Cryptography (`ring`, `argon2`)**
  - **Why?**: To secure the password vault. We need to generate random passwords, derive keys from a master password, and encrypt/decrypt data.
  - **Application**: The core of the Password Generator and Secure Storage feature.

- **Concurrency (`std::thread` or `tokio`)**
  - **Why?**: To run background tasks without blocking the UI, such as monitoring the clipboard.
  - **Application**: The Clipboard Manager will use a background thread to poll for clipboard changes.

- **Using External Crates (`Cargo.toml`)**
  - **Why?**: To leverage the rich Rust ecosystem instead of reinventing the wheel.
  - **Application**: Integrating `pulldown-cmark` for markdown parsing, `serde` for JSON serialization, `arboard` for clipboard access, and the crypto crates.

### c. Recommended Resources
- **[The Rust Programming Language ("The Book")](https://doc.rust-lang.org/book/)**: Essential for a deep, foundational understanding.
- **[Rust by Example](https://doc.rust-lang.org/rust-by-example/)**: Excellent for seeing practical, bite-sized implementations of concepts.

## 2. Tauri Framework Concepts

Tauri connects our Rust backend to the SvelteKit frontend, providing the desktop application shell and a secure bridge for communication.

- **Project Setup and Configuration (`tauri.conf.json`)**
  - **Why?**: To define the application's identity, permissions, and window properties.
  - **Application**: Configuring the `allowlist` to enforce security and setting up the initial window size and title.

- **The Command System (`#[tauri::command]`)**
  - **Why?**: This is the primary way our frontend will invoke Rust functions.
  - **Application**: Creating commands like `save_note`, `get_clipboard_history`, and `unlock_vault` that the SvelteKit UI can call.

- **State Management (`tauri::State`)**
  - **Why?**: To manage shared data on the Rust side that needs to be accessed by multiple commands in a thread-safe way.
  - **Application**: Holding the application settings, the clipboard history, and the current state of the password vault (`Locked`/`Unlocked`).

- **The Event System (`window.emit()`, `window.listen()`)**
  - **Why?**: To allow the Rust backend to proactively send data to the frontend without being asked.
  - **Application**: The clipboard monitor will emit an event to the frontend whenever a new item is copied, updating the UI in real-time.

- **Tauri APIs**
  - **Why?**: To interact with the host operating system in a safe, cross-platform way.
  - **Application**: Using the `fs` and `path` APIs for file management and the `clipboard` API for the clipboard manager.

### c. Recommended Resources
- **[Tauri Documentation](https://v2.tauri.app/)**: The official source for guides, API references, and security best practices.
- **[Tauri GitHub Examples](https://github.com/tauri-apps/examples)**: A great place to find working code for specific features.

## 3. SvelteKit Frontend Concepts

SvelteKit provides the tools to build a fast, modern, and reactive user interface for VaultNote.

- **Component-Based Architecture**
  - **Why?**: To break the UI down into small, reusable, and manageable pieces.
  - **Application**: Creating components for the `MarkdownEditor`, `PreviewPane`, `ClipboardItem`, `PasswordVaultView`, etc.

- **Reactivity (Runes: `$state`, `$derived`)**
  - **Why?**: To create fine-grained, explicit reactivity. `$state` creates reactive variables, and `$derived` creates values that are calculated from them.
  - **Application**: The markdown input will be a `$state` variable. The HTML preview will be a `$derived` value that re-calculates whenever the input changes.

- **State Management (Runes in `.svelte.js` files)**
  - **Why?**: Runes allow reactive state (`$state`, `$derived`) to be defined in regular JavaScript/TypeScript files (with a `.svelte.js/ts` extension) and imported into components, replacing the need for the old Store API.
  - **Application**: Creating reactive variables in files like `src/lib/state/settings.svelte.js` to manage global settings, clipboard history, and vault state.

- **Forms and User Input (`on:submit`, `bind:value`)**
  - **Why?**: To capture user input for notes, settings, and passwords.
  - **Application**: The markdown editor's text area, the settings page form, and the master password unlock form.

- **Lifecycle (`$effect`)**
  - **Why?**: To run side effects after the DOM has been rendered or when state changes. `$effect` replaces `onMount`, `onDestroy`, and `$: ` for side effects.
  - **Application**: Using `$effect` to fetch initial data from the Rust backend (e.g., loading settings) and to set up/tear down listeners for Tauri events.

### c. Recommended Resources
- **[Svelte 5 Tutorial](https://svelte.dev/tutorial)**: The best place to start for a hands-on introduction to Runes.
- **[SvelteKit Documentation](https://kit.svelte.dev/docs)**: The official reference for routing, components, and more.