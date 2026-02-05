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

To build **VaultNote**, a secure productivity hub with a markdown editor, clipboard manager, and password generator/storage using Tauri, Rust, and SvelteKit, integrating `shadcn-svelte` components will enhance the UI with accessible, customizable elements. Below, I’ll identify the necessary `shadcn-svelte` components based on the [VaultNote Project Plan](#c06b0723-9eec-47cd-bdf9-1f76d00d20e3) and provide the command to add them, formatted as requested. I’ll also explain why each component is needed, how it fits into the project, and ensure the plan is beginner-friendly for learning Rust and Tauri, while leveraging the `shadcn-svelte` documentation for guidance.[](https://shadcn-svelte.com/docs)

---

## Required shadcn-svelte Components

Based on the VaultNote project plan, the app requires a clean, accessible, and consistent UI for the markdown editor, clipboard manager, password vault, and settings. The following `shadcn-svelte` components are essential to achieve this, mapped to the features outlined in the plan:

### 1. Markdown Editor with Autosave
- **Components Needed**:
  - **Input**: For the markdown text input area where users type notes.
    - **Why**: The `<Input>` component provides a styled text area for markdown entry, supporting features like placeholders and accessibility attributes.[](https://www.shadcn-svelte.com/docs/components/input)
    - **Usage**: Used in a `<textarea>` mode for multi-line markdown input, with `bind:value` to capture user input and trigger autosave.
  - **Button**: For actions like saving notes manually or clearing the editor.
    - **Why**: Buttons trigger actions (e.g., “Save Note” or “New Note”) and can be styled with variants like `outline` or `secondary` for a consistent look.[](https://www.shadcn-svelte.com/docs/components/button)
    - **Usage**: Add buttons for manual save or editor controls, with `on:click` handlers to invoke Rust commands via Tauri.
  - **Label**: To label the input field for accessibility.
    - **Why**: Enhances UX by clearly indicating the purpose of the input field (e.g., “Markdown Note”).[](https://www.shadcn-svelte.com/docs/components/input)
    - **Usage**: Pair with `<Input>` to provide context, ensuring ARIA compliance.
  - **Card**: To wrap the editor and preview panes for a clean, organized layout.
    - **Why**: Provides a styled container for the editor and preview, making the UI visually distinct.[](https://www.shadcn-svelte.com/docs/components/switch)
    - **Usage**: Use to separate the markdown input and rendered preview in a two-column layout.

### 2. Clipboard Manager
- **Components Needed**:
  - **Button**: For actions like “Save as Note” or “Insert into Current Note.”
    - **Why**: Each clipboard item needs buttons for user actions, supporting variants like `ghost` for minimal designs.[](https://next.shadcn-svelte.com/docs/components/button)
    - **Usage**: Display a list of clipboard items with buttons to save or insert, using `on:click` to call Tauri commands.
  - **Card**: To display clipboard history items in a clean, card-based list.
    - **Why**: Organizes clipboard snippets visually, making them easy to browse.[](https://www.shadcn-svelte.com/docs/components/switch)
    - **Usage**: Each clipboard entry is a card with text preview and action buttons.
  - **Scroll Area**: For scrolling through a long clipboard history.
    - **Why**: Ensures the clipboard sidebar remains navigable if many items are stored.[](https://www.shadcn-svelte.com/docs/components/switch)
    - **Usage**: Wrap the clipboard list in a `<ScrollArea>` to handle overflow gracefully.

### 3. Password Generator and Secure Storage
- **Components Needed**:
  - **Input**: For entering the master password and labeling stored passwords.
    - **Why**: Supports secure input (e.g., `type="password"`) for the master password and labels for stored credentials.[](https://next.shadcn-svelte.com/docs/components/input)
    - **Usage**: Use for master password entry and fields to label passwords (e.g., “GitHub Password”).
  - **Button**: For generating passwords, saving to the vault, or copying passwords.
    - **Why**: Triggers actions like generating a random password or unlocking the vault.[](https://www.shadcn-svelte.com/docs/components/button)
    - **Usage**: Include buttons like “Generate Password” or “Copy to Clipboard” with `on:click` handlers.
  - **Dialog**: To prompt for the master password or confirm actions like saving a password.
    - **Why**: Provides a modal for secure master password entry or confirmation dialogs, ensuring focus and security.[](https://www.shadcn-svelte.com/docs/components/dialog)
    - **Usage**: Use `<Dialog.Root>` to show a password prompt before accessing the vault.
  - **Label**: To label password input fields for clarity and accessibility.
    - **Why**: Ensures users understand input fields (e.g., “Master Password”).[](https://www.shadcn-svelte.com/docs/components/input)
    - **Usage**: Pair with `<Input>` for password fields.
  - **Form**: To validate and handle password input forms.
    - **Why**: Integrates with `sveltekit-superforms` and `zod` for client-side validation of password inputs (e.g., master password strength).[](https://www.shadcn-svelte.com/docs/components/form)
    - **Usage**: Wrap password input and buttons in a `<Form>` for validation and submission.

### 4. Additional Features (Settings and Unified Interface)
- **Components Needed**:
  - **Tabs**: To switch between editor, clipboard, and password vault views.
    - **Why**: Provides a clean way to navigate between app sections (e.g., Notes, Clipboard, Vault).[](https://www.shadcn-svelte.com/docs/components/switch)
    - **Usage**: Use `<Tabs.Root>` to organize the app into tabbed sections.
  - **Switch**: For settings like enabling/disabling autosave or toggling dark mode.
    - **Why**: Allows users to toggle settings with a clear on/off state, ideal for configuration options.[](https://www.shadcn-svelte.com/docs/components/switch)
    - **Usage**: Use in a settings panel for options like “Enable Autosave.”
  - **Select**: For choosing options like password length or character types in the generator.
    - **Why**: Provides a dropdown for selecting predefined options, enhancing the password generator UX.[](https://shadcn-svelte.com/docs/components/select)
    - **Usage**: Use for settings like password length (e.g., 12, 16, 24 characters).
  - **Button**: For saving settings or confirming actions.
    - **Why**: Needed for settings submission or other actions in the settings panel.[](https://www.shadcn-svelte.com/docs/components/button)
    - **Usage**: Include a “Save Settings” button with `on:click` to save to a JSON file via Tauri.

---

## Command to Add Components

To add the required `shadcn-svelte` components to your SvelteKit project, run the following command:

```bash
bun x shadcn-svelte@latest add button input card scroll-area dialog label form tabs switch select
```

This command installs the components listed above, placing them in your project’s `$lib/components/ui` directory (assuming default aliases from the VaultNote plan). Each component comes with TypeScript support and Tailwind CSS styling, making them easy to customize.[](https://www.shadcn-svelte.com/docs/installation/sveltekit)

---

## Implementation Notes

### Why These Components?
- **Accessibility**: `shadcn-svelte` components are built with ARIA attributes, ensuring VaultNote is usable for all users.[](https://www.shadcn-svelte.com/docs/components/form)
- **Customizability**: Components are copy-pasteable, allowing you to edit styles or behavior directly, which is great for learning and tailoring to VaultNote’s design.[](https://shadcn-svelte.com/docs)
- **Consistency**: Built with Bits UI and Tailwind CSS, they provide a unified look across the app.[](https://shadcn-svelte.com/docs)
- **Integration with Forms**: The `Form` component, paired with `sveltekit-superforms` and `zod`, simplifies validation for password inputs, crucial for the vault.[](https://www.shadcn-svelte.com/docs/components/form)

### How to Use in VaultNote
- **Markdown Editor**: Use `<Card>` to wrap `<Input>` (as a textarea) and a preview div. Add `<Button>` for actions like clearing the editor. Use `<Label>` for accessibility.
- **Clipboard Manager**: Display clipboard items in `<Card>` components within a `<ScrollArea>`. Each card has `<Button>` elements for saving or inserting snippets.
- **Password Vault**: Use `<Dialog>` for master password prompts, `<Form>` with `<Input>` for password entry, and `<Button>` for generating/saving passwords. Add `<Select>` for password options.
- **Settings**: Use `<Tabs>` to organize the app, `<Switch>` for toggles, and `<Button>` to save settings.

### Avoiding Pitfalls
- **Event Handling**: As noted in Reddit discussions, `shadcn-svelte` components like `Switch` may not support `on:click` directly. Use exported props (e.g., `bind:checked` for `Switch`) or check component source for event handling.[](https://www.reddit.com/r/sveltejs/comments/16zedez/trying_to_get_shadcn_components_to_interact_with/)
- **Component References**: Avoid issues with binding references (e.g., `bind:this`) by removing fallback values if needed, as discussed on GitHub.[](https://github.com/huntabyte/shadcn-svelte/discussions/418)
- **Form Validation**: Use `sveltekit-superforms` with `zod` for robust form handling, as shown in `shadcn-svelte` examples.[](https://www.shadcn-svelte.com/docs/components/form)
- **Overcomplication**: Start with basic component usage (e.g., default `<Button>`) before exploring variants or custom styles.

### Learning Rust and Tauri with Components
- **Rust**: Use components to trigger Tauri commands (e.g., `<Button>` on:click calls a Rust function to save a file). Learn Rust’s `serde` for JSON serialization to handle settings.[](https://shadcn-svelte.com/docs)
- **Tauri**: Map component actions to Tauri APIs (e.g., file system for autosave, clipboard for snippets). Study Tauri’s [file system](https://v2.tauri.app/plugin/filesystem/) and [clipboard](https://v2.tauri.app/plugin/clipboard/) APIs.[](https://shadcn-svelte.com/docs)
- **SvelteKit**: Use Svelte stores to manage state (e.g., clipboard history) and bind component values (e.g., `<Input bind:value>`) to update Rust via Tauri commands.

---

## Extended Ideas for Components
To enhance VaultNote and deepen your learning:
- **Toast (Sonner)**: Add notifications for actions like “Note Saved” or “Password Generated” using the `Sonner` component.[](https://www.shadcn-svelte.com/docs/components/switch)
  - **Command**: `bun x shadcn-svelte@latest add sonner`
  - **Why**: Provides user feedback, enhancing UX.
- **Tooltip**: Add tooltips to buttons (e.g., “Copy to Clipboard”) for clarity.[](https://www.shadcn-svelte.com/docs/components/switch)
  - **Command**: `bun x shadcn-svelte@latest add tooltip`
  - **Why**: Improves usability for new users.
- **Progress**: Show a progress bar for password strength in the generator.[](https://www.shadcn-svelte.com/docs/components/switch)
  - **Command**: `bun x shadcn-svelte@latest add progress`
  - **Why**: Visual feedback for secure passwords.

To add these extra components later, run:
```bash
bun x shadcn-svelte@latest add sonner tooltip progress
```

---

## Learning Path Integration
- **Rust Concepts**: Use `serde` for settings, `ring` for password encryption, and `pulldown-cmark` for markdown parsing. Practice ownership and borrowing when handling component-triggered data.
- **Tauri APIs**: Leverage file system APIs for autosave, clipboard APIs for snippets, and command system for frontend-backend communication.
- **SvelteKit**: Master reactive bindings (e.g., `<Input bind:value>`) and stores for state management. Use `shadcn-svelte`’s form components with `sveltekit-superforms` for validation.[](https://www.shadcn-svelte.com/docs/components/form)
- **Resources**:
  - [shadcn-svelte Docs](https://www.shadcn-svelte.com/) for component usage.[](https://shadcn-svelte.com/docs)
  - [Tauri Docs](https://v2.tauri.app/) for file and clipboard APIs.
  - [Rust Book](https://doc.rust-lang.org/book/) for foundational Rust skills.

---

## Final Notes
The command `bun x shadcn-svelte@latest add button input card scroll-area dialog label form tabs switch select` sets you up with the core UI components for VaultNote. Start with the markdown editor, using `<Input>`, `<Button>`, `<Card>`, and `<Label>`, then add clipboard and password features. The components are lightweight, accessible, and integrate seamlessly with SvelteKit, making them ideal for your learning journey. As you progress, consider adding `Sonner`, `Tooltip`, or `Progress` for polish.
