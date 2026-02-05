# Feature: Password Generator and Secure Storage

## 1. Description

This feature provides a secure vault for generating and storing passwords. All stored credentials will be encrypted using a strong algorithm and can only be accessed by unlocking the vault with a single master password. This ensures that sensitive data is protected both at rest and in the application.

## 2. Core Functionality

- **Master Password Protection**: The entire vault is secured by a single master password. The vault must be unlocked at the beginning of each session to access any stored data.
- **Secure Password Generation**: Users can generate strong, random passwords with customizable options, such as length and the inclusion of numbers, symbols, and uppercase/lowercase letters.
- **Credential Storage**: Generated or manually entered passwords can be saved with a descriptive label (e.g., "Google Account," "GitHub") for easy identification.
- **Vault Management**: Once unlocked, users can view, copy, or delete stored password entries.
- **Automatic Locking**: The vault will automatically lock after a period of inactivity or when the application is closed.

## 3. Technical Implementation

### Backend (Rust & Tauri)

- **Cryptography Crates**:
    - `ring`: For AEAD encryption (AES-256-GCM) and secure random number generation.
    - `argon2`: For deriving a strong encryption key from the master password and hashing it for verification.
    - `rand`: For generating cryptographically secure random passwords with character set customization.

- **Master Password and Key Derivation**:
    - **Setup**: The first time a user sets a master password, a unique salt is generated using `ring::rand::SystemRandom`.
    - **Hashing**: The master password combined with the salt is hashed using Argon2. This hash is stored and used later to verify the password upon unlocking. The master password itself is never stored.
    - **Key Derivation**: A separate Argon2 process derives a 32-byte encryption key from the master password and salt. This key is **only held in memory** while the vault is unlocked.

- **Encryption and Decryption**:
    - **Algorithm**: AES-256-GCM will be used for its high security and authentication features, which protect against tampering.
    - **Process**: Each password entry (the password string and its label) will be serialized (e.g., to JSON) and then encrypted. A unique nonce (a number used once) is generated for each encryption operation and stored alongside the resulting ciphertext.

- **Storage**:
    - A single, local file (e.g., `vault.dat`) will be used to store the vault's data. This file will be located in the application's data directory (`tauri::api::path::app_data_dir`).
    - **File Structure**:
        - The Argon2 salt.
        - The Argon2 hash of the master password (for verification).
        - A list of encrypted password entries, each containing the nonce and the ciphertext.

- **State Management and Tauri Commands**:
    - A `VaultState` struct wrapped in a `Mutex` and managed by Tauri (`tauri::State`) will hold the vault's status (`Locked` or `Unlocked { key: Vec<u8> }`).
    - **Commands**:
        - `setup_vault(master_password: String)`: Initializes the vault, hashes the password, and creates the vault file.
        - `unlock_vault(master_password: String)`: Verifies the password against the stored hash, derives the encryption key, and moves the vault state to `Unlocked`.
        - `lock_vault()`: Clears the encryption key from memory and sets the state to `Locked`.
        - `generate_password(length: u8, use_symbols: bool, use_numbers: bool)`: Creates a new random password.
        - `save_password(label: String, password: String)`: Encrypts and saves a new credential to the vault file. Requires the vault to be unlocked.
        - `get_passwords()`: If the vault is unlocked, decrypts and returns the list of all stored labels and passwords.
        - `delete_password(entry_id: String)`: Removes a specific credential from the vault.

### Frontend (SvelteKit)

- **Component Structure**:
    - `PasswordVaultView.svelte`: The main component that conditionally renders either the lock screen or the main vault interface.
    - `UnlockForm.svelte`: A simple form to input the master password. It calls the `unlock_vault` command.
    - `PasswordGenerator.svelte`: A UI with sliders/checkboxes for password generation options and a button to trigger generation.
    - `PasswordListView.svelte`: Displays the list of decrypted credentials. Each item will have "Copy" and "Delete" buttons.
    - `AddPasswordForm.svelte`: A form for manually adding a new password entry.

- **State Management**:
    - A reactive object created with `$state` will track the application's view of the vault's state, e.g., `let vault = $state({ locked: true, entries: [] })`.
    - When the user successfully unlocks the vault, the properties of this reactive object are updated (`vault.locked = false`, `vault.entries = decrypted_entries`).
    - When the vault is locked, the `entries` array is cleared (`vault.entries = []`).

- **Security on the Frontend**:
    - All sensitive operations (encryption, decryption, password verification) are exclusively handled by the Rust backend.
    - The master password is sent from the form directly to the Tauri command and is not stored in Svelte state.
    - Decrypted passwords are only held in a reactive `$state` variable while the vault is unlocked.

## 4. Best Practices

- **Zero-Knowledge Principle**: The master password is never stored, and the encryption key only exists in memory when the vault is unlocked.
- **Secure Defaults**: The password generator will default to strong settings (e.g., 16+ characters, including symbols and numbers).
- **Error Handling**: Rust functions will return detailed `Result` types to inform the frontend of specific failures (e.g., "Invalid Master Password," "Decryption Failed").
- **Clear Clipboard**: After a user copies a password, it should be cleared from the system clipboard after a short, configurable timeout (e.g., 30 seconds) to prevent accidental exposure.

## 5. What to Avoid

- **Storing Sensitive Data in Plain Text**: Never store the master password, the derived encryption key, or unencrypted passwords on disk or in frontend state when locked.
- **Weak Cryptography**: Do not use outdated or weak algorithms like DES, MD5, or SHA1. Stick to modern, vetted standards like AES-256-GCM and Argon2.
- **Rolling Your Own Crypto**: Rely exclusively on well-audited, mainstream Rust crates like `ring` and `argon2`.

## 6. Future Enhancements

- **Password Strength Meter**: Integrate a library like `zxcvbn` to provide real-time feedback on the strength of new or generated passwords.
- **Secure Import/Export**: Add functionality to export the vault to an encrypted file (e.g., for backups) and import from it.
- **Custom Fields**: Allow users to add extra fields to a password entry, such as username, URL, or notes.

## 7. Learning Focus

- **Rust**: Advanced cryptography with the `ring` crate, secure key derivation and hashing with `argon2`, and managing sensitive data in memory.
- **Tauri**: Securely managing application state (`tauri::State`) that contains sensitive data, and designing a command API for a security-critical feature.
- **SvelteKit**: Building a UI with conditional rendering based on security state (locked/unlocked), handling forms for sensitive input, and managing reactive state with Runes (`$state`) that is cleared and populated based on backend events.