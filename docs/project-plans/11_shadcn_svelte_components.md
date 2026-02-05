# Required `shadcn-svelte` Components for VaultNote

This document outlines the specific `shadcn-svelte` components required to build the user interface for VaultNote. Using these pre-built, accessible, and themeable components will accelerate development and ensure a consistent, high-quality user experience.

The components are organized by the core feature they will be used to implement.

## 1. Markdown Editor with Autosave

This feature requires components for text input, user actions, and layout.

-   **`Textarea`**: The primary input field for users to write their markdown notes.
    -   **Why**: It's designed for multi-line text entry, which is essential for note-taking.
    -   **Usage**: Will be bound to a reactive `$state` variable that holds the current note's content. The `oninput` event will be used to trigger the autosave logic.

-   **`Button`**: For explicit user actions like creating a new note or forcing a manual save.
    -   **Why**: Provides clear, clickable targets for primary actions. Variants like `default` and `outline` can be used to establish visual hierarchy.
    -   **Usage**: An "New Note" button to clear the editor and a "Save" button to manually trigger the `save_note` Tauri command.

-   **`Label`**: To ensure the textarea is accessible.
    -   **Why**: Connects a descriptive label to the input field, which is critical for screen reader users.
    -   **Usage**: Placed above the `<Textarea>` to identify its purpose (e.g., "Your Note").

-   **`Card`**: To visually contain and separate the editor and the preview panes.
    -   **Why**: Creates a clean, bordered container that organizes the UI into distinct sections.
    -   **Usage**: The entire editor feature will be wrapped in a `<Card>`, with internal elements like `<Card.Header>`, `<Card.Content>`, and `<Card.Footer>`.

-   **`Separator`**: To create a visual dividing line between the editor and preview panes.
    -   **Why**: Improves the layout by clearly distinguishing the input area from the rendered output.
    -   **Usage**: A `<Separator orientation="vertical" />` will be placed between the two columns of the editor view.

## 2. Clipboard Manager

This feature needs components to display a list of items and allow interaction with them.

-   **`Card`**: To display each clipboard history item.
    -   **Why**: Provides a structured and visually appealing way to list individual snippets.
    -   **Usage**: The list of clipboard items will be rendered as a series of `<Card>` components, each containing a text preview and action buttons.

-   **`Button`**: For actions on each clipboard item, such as "Copy" or "Insert into Note".
    -   **Why**: Enables direct interaction with each snippet. The `ghost` and `icon` variants are perfect for creating unobtrusive action buttons.
    -   **Usage**: Each card will have a "Copy" button (`onclick`) and an "Insert" button that calls a function passed down as a prop (e.g., `onInsert`) to send the content to the editor.

-   **`Scroll Area`**: To ensure the list of clipboard items is scrollable.
    -   **Why**: Prevents the UI from breaking if the clipboard history becomes very long.
    -   **Usage**: The `<div>` containing the list of `<Card>` components will be wrapped in a `<ScrollArea>`.

-   **`Badge`**: To tag clipboard items in the future (e.g., "Text", "Image", "URL").
    -   **Why**: Provides a way to add small, color-coded metadata labels to items.
    -   **Usage**: A potential future enhancement where each clipboard card could have a `<Badge>` indicating its content type.

## 3. Password Generator and Secure Storage

This security-critical feature requires modals, secure inputs, and interactive controls.

-   **`Dialog`**: To create a modal prompt for the master password.
    -   **Why**: A modal dialog forces the user to interact with the prompt before using the rest of the application, which is essential for a security gate like this.
    -   **Usage**: The password vault will be protected by a `<Dialog>` that only opens to reveal the content after the correct master password has been entered.

-   **`Input`**: For the master password field and for labeling new password entries.
    -   **Why**: The component supports `type="password"` to obscure input, which is mandatory for the master password.
    -   **Usage**: One `<Input type="password">` in the unlock dialog and another `<Input type="text">` for the label of a new password entry.

-   **`Slider`**: To allow the user to select the desired length for a generated password.
    -   **Why**: Provides an intuitive, visual way to select a number within a range.
    -   **Usage**: A slider from 8 to 64 will control the length parameter for the password generation function.

-   **`Checkbox`**: To toggle character types (symbols, numbers) in the password generator.
    -   **Why**: The standard and most intuitive way to handle multiple independent boolean options.
    -   **Usage**: Checkboxes for "Include Symbols" and "Include Numbers" will control the generation parameters.

-   **`Sonner`** (or `Toast`): To provide non-intrusive feedback when a user copies a password.
    -   **Why**: Informs the user that the action was successful without requiring a disruptive alert. It can also be used to show a countdown for clipboard clearing.
    -   **Usage**: When the "Copy" button is clicked, a toast will appear saying "Password copied to clipboard. Will clear in 30s."

## 4. Unified Interface & Settings

These components are for global navigation and application configuration.

-   **`Tabs`**: To create the main navigation between "Notes", "Clipboard", and "Passwords".
    -   **Why**: A classic and widely understood pattern for switching between major sections of an application.
    -   **Usage**: The main application layout will use `<Tabs>` to control which feature view is currently displayed in the main content area.

-   **`Switch`**: For toggling boolean settings.
    -   **Why**: The ideal component for on/off options.
    -   **Usage**: In the settings page for options like "Enable Autosave," "Dark Mode," and "Clear Clipboard on Exit."

-   **`Select`**: For settings that require choosing from a predefined list.
    -   **Why**: A dropdown menu is perfect for a compact selection UI.
    -   **Usage**: For setting the theme ("Light", "Dark", "System") or the auto-lock timeout for the vault ("5 minutes", "15 minutes", "30 minutes").

---

## Command to Add All Components

You can add all the necessary components to your project with the following command:

```bash
npx shadcn-svelte@latest add button card checkbox dialog input label scroll-area select separator slider sonner switch tabs textarea
```
