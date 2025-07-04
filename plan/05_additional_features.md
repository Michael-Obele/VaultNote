# Additional Features: Unified Interface, Settings, and Security

This document outlines features that tie the core components of VaultNote together, focusing on user experience, customizability, and overall application integrity.

## 1. Unified Interface

A cohesive and intuitive user interface is crucial for making VaultNote a productive tool. The goal is to integrate the Markdown Editor, Clipboard Manager, and Password Vault into a single, seamless application window.

### a. Layout and Design

- **Primary Layout**: The application will use a two-column layout.
    - **Sidebar (Left Column)**: A persistent sidebar will contain navigation icons to switch between the main features: Notes, Clipboard, and Passwords. It will also provide access to the Settings page.
    - **Main Content Area (Right Column)**: This area will render the currently selected feature's view (e.g., the markdown editor, the clipboard history list, or the password vault).
- **Component-Based Structure (SvelteKit)**:
    - `AppLayout.svelte`: The root layout component that includes the sidebar and the main content slot.
    - `Sidebar.svelte`: The navigation component with links/buttons to switch views.
    - `Router`: SvelteKit's file-based routing will be used to manage the views. The routes could be:
        - `/`: Defaults to the Markdown Editor.
        - `/clipboard`: The Clipboard Manager view.
        - `/passwords`: The Password Vault view.
        - `/settings`: The Settings view.
- **Responsiveness**: The layout will be designed to be functional and clean, even though it is a desktop-first application.

### b. Seamless Integration

- **Cross-Feature Interaction**: The design will allow for intuitive interactions between features. For example:
    - A button in the Clipboard Manager to "Send to New Note" will switch to the Notes view and populate a new note with the clipboard content.
    - A button in the Password Vault to "Copy Password" will place the password on the clipboard, which will then appear in the Clipboard Manager's history (with appropriate security considerations, like auto-clearing).

## 2. Application Settings

A dedicated settings page will allow users to customize the application's behavior to fit their workflow.

### a. Configurable Options

- **General**:
    - **Theme**: Light, Dark, or System default.
- **Markdown Editor**:
    - **Autosave Interval**: A slider or input to set the delay in seconds.
- **Clipboard Manager**:
    - **History Size**: A number input to define how many items to store (e.g., 20-100).
    - **Clear on Exit**: A toggle to decide whether to clear clipboard history when the app closes.
    - **Auto-clear Passwords**: A toggle and a timeout setting (in seconds) for clearing copied passwords from the clipboard.
- **Password Vault**:
    - **Auto-lock Timeout**: An input to set the inactivity period (in minutes) after which the vault locks itself.

### b. Technical Implementation

- **Backend (Rust & Tauri)**:
    - **Settings Struct**: A Rust struct `AppSettings` will be defined, using `serde::{Serialize, Deserialize}` for easy conversion to/from JSON.
    - **Storage**: Settings will be stored in a `settings.json` file within the application's config directory (`tauri::api::path::app_config_dir`).
    - **State Management**: The loaded settings will be managed by Tauri as a global `tauri::State<Mutex<AppSettings>>` to ensure thread-safe access from any command.
    - **Tauri Commands**:
        - `#[tauri::command] async fn get_settings(state: State<'_, AppState>) -> AppSettings`: Retrieves the current settings.
        - `#[tauri::command] async fn update_settings(new_settings: AppSettings, state: State<'_, AppState>)`: Overwrites the settings in memory and saves them to `settings.json`.

- **Frontend (SvelteKit)**:
    - **State Management**: A reactive settings object will be created with `let settings = $state(...)`. It will be initialized by calling `get_settings` when the app loads.
    - `SettingsView.svelte`: A component containing a form with various inputs (toggles, sliders, text fields) bound to the reactive `settings` object.
    - **Reactivity**: When the user changes a setting, the form will automatically update the reactive `settings` object. A "Save" button or an `onchange` event with debouncing will call the `update_settings` Tauri command to persist the changes.

## 3. Overall Application Security

Security is a foundational principle of VaultNote, extending beyond just the password vault.

### a. Tauri Configuration

- **API Allowlist**: The `tauri.conf.json` file will be configured with a strict `allowlist`. Only the necessary APIs from Tauri will be enabled (e.g., `fs` scoped to app directories, `clipboard`, `event`, `window`). This minimizes the application's attack surface.
- **Content Security Policy (CSP)**: A strict CSP will be defined to prevent loading of untrusted remote content in the webview.

### b. Dependency Management

- **Auditing**: Regular audits of both Rust (`cargo audit`) and npm (`npm audit`) dependencies will be performed to identify and patch known vulnerabilities.
- **Minimalism**: Only necessary dependencies will be used to reduce complexity and potential security risks.

### c. Secure Practices

- **No Sensitive Data in Frontend Logic**: All cryptographic operations and sensitive data handling will be confined to the Rust backend. The frontend will only display data and collect user input.
- **Principle of Least Privilege**: The application will only request the permissions it absolutely needs to function. For example, file system access will be programmatically restricted to the app's own data and config directories.

## 4. Learning Focus

- **Rust**:
    - JSON serialization and deserialization with `serde`.
    - Structuring a configuration management system.
- **Tauri**:
    - Configuring the `allowlist` and understanding its security implications.
    - Using the `path` API to correctly locate application-specific directories.
    - Managing shared, mutable state across commands (`tauri::State`).
- **SvelteKit**:
    - Advanced routing and nested layouts.
    - Global state management with Runes (`$state`) for configuration data.
    - Creating complex, reactive forms for settings.