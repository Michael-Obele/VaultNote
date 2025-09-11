# VaultNote

A modern, secure, and open-source desktop application designed to be a productivity hub for professionals, developers, and power users. VaultNote integrates essential tools into a single, focused, and trustworthy environment.

## Overview

VaultNote is built with a focus on security, performance, and user experience. It combines a Rust backend with a modern Svelte 5 frontend, all packaged into a lightweight desktop application using Tauri. This project serves both as a practical, real-world tool and as a comprehensive learning path for mastering the Rust and Tauri ecosystem.

## Core Features

The application is built around three primary features:

### 1. 📝 Markdown Editor

A focused, minimalist markdown editor designed for clarity and concentration.

- **Live Preview:** See your rendered markdown update in real-time as you type.
- **Autosave:** Never lose your work, with changes saved automatically to your local file system.
- **Secure Storage:** Notes are stored locally in a dedicated application directory.

### 2. 📋 Clipboard Manager

An intelligent clipboard manager that works seamlessly to improve your workflow.

- **History Tracking:** Automatically captures and stores a history of text you've copied.
- **Easy Access:** Quickly browse, search, and reuse items from your clipboard history.
- **Editor Integration:** Insert snippets directly into the active note.

### 3. 🔐 Secure Password Vault

A robust password manager built with zero-knowledge principles.

- **Strong Encryption:** Credentials are encrypted with AES-256-GCM using a key derived from your master password with Argon2. Your master password is never stored.
- **Password Generation:** Create strong, random, and customizable passwords.
- **Secure Credential Storage:** Save and organize your passwords with labels for easy retrieval.

## Technology Stack

VaultNote leverages a modern and powerful technology stack:

- **Backend:** **Rust** for its performance, memory safety, and robust concurrency. It handles all core logic, including file I/O, cryptography, and system interactions.
- **Desktop Framework:** **Tauri** to create a secure, lightweight, and cross-platform desktop application using web technologies for the frontend.
- **Frontend:** **Svelte 5 (SvelteKit)**, utilizing the new Runes API for a more explicit, powerful, and performant reactive UI.
- **UI Components:** **shadcn-svelte**, providing a library of accessible, themeable, and professional components.
- **Styling:** **Tailwind CSS** for a utility-first styling workflow.

## Development Workflow

The development of VaultNote follows a structured, iterative approach, broken down into distinct phases:

1.  **Phase 1: Project Setup & Foundation:** Initialize the project, configure tooling, and create the basic application layout and routing.
2.  **Phase 2: Markdown Editor:** Implement the core note-taking functionality.
3.  **Phase 3: Clipboard Manager:** Introduce background tasks and real-time UI updates.
4.  **Phase 4: Password Vault:** Build the security-critical password management feature.
5.  **Phase 5: Settings & Polish:** Add user configuration and refine the user experience.
6.  **Phase 6: Final Review & Distribution:** Conduct audits, finalize documentation, and build the application.

For a detailed breakdown of the development plan, please refer to the documents in the `/plan` directory.

## Recent Progress & Status (short)

Since the initial project setup we've completed a number of important stability and CI improvements. Key highlights:

- Automated version synchronization across `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml` to avoid semver errors during Tauri builds.
- Resolved Tauri plugin version mismatches between NPM packages and Rust crates so plugin versions stay aligned.
- Fixed Android build and CI issues including correct APK pathing and streamlined signing in GitHub Actions workflows.
- Improved the repository's CI/CD workflows and added documentation that records troubleshooting steps and solutions.

All troubleshooting and solution documents have been consolidated into the `progress/` folder. See `progress/README.md` for an index and detailed write-ups.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Rust:** Ensure you have the Rust toolchain installed. You can get it from [rustup.rs](https://rustup.rs/).
- **Node.js:** Ensure you have Node.js and npm installed. You can get it from [nodejs.org](https://nodejs.org/).

### Installation & Running

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/VaultNote.git
    cd VaultNote
    ```
2.  **Install frontend dependencies:**
    ```sh
    npm install
    ```
3.  **Run the application in development mode:**
    `sh
    npm run tauri dev
    `
    **Last Updated:** September 11, 2025

### Quick start (dev)

Prerequisites:

- Rust (via rustup) and Node.js/npm installed

Run locally:

```bash
git clone https://github.com/your-username/VaultNote.git
cd VaultNote
npm install
npm run tauri dev
```

See `progress/README.md` for full operational notes, build fixes, and CI guidance.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

This project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for the full license text.
