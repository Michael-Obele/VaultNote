# Feature: Markdown Editor with Autosave

## 1. Description

This feature provides a simple yet powerful markdown editor for note-taking. It will support standard markdown syntax, offer a real-time preview of the rendered output, and automatically save changes to prevent data loss.

## 2. Core Functionality

- **Markdown Input**: A dedicated text area for users to write and edit markdown content.
- **Live Preview**: A separate pane that displays the rendered HTML of the markdown in real-time as the user types.
- **Autosave**: Changes will be saved automatically to the local file system at regular intervals (e.g., every 5 seconds) and on specific user actions (e.g., when the editor loses focus).
- **File Operations**: Users can create new notes, open existing notes, and save them explicitly.

## 3. Technical Implementation

### Frontend (SvelteKit)

- **Component Structure**:
    - `MarkdownEditor.svelte`: A primary component containing the text area for input.
    - `PreviewPane.svelte`: A component that takes markdown text as a prop and displays the rendered HTML.
    - `NoteView.svelte`: A parent component that orchestrates the editor, preview, and file operations.
- **Reactivity**: A `$effect` will be used to watch for changes in the markdown input. When the text changes, this effect will call the backend to parse the markdown for the live preview. The call will be debounced to prevent excessive calls to the backend during rapid typing.
- **State Management**: Reactive state variables created with `$state` will manage the current note's content, its file path, and its dirty (unsaved) status.
- **Tauri API Calls**: The frontend will use Tauri's `invoke` function to call Rust backend commands for file I/O and markdown parsing.

### Backend (Rust & Tauri)

- **Markdown Parsing**:
    - The `pulldown-cmark` crate will be used to parse the markdown string sent from the frontend into an HTML string.
    - A Tauri command, `#[tauri::command] async fn parse_markdown(text: String) -> String`, will expose this functionality.
- **File System Operations**:
    - Tauri's `fs` module (`tauri::api::file`) will be used for reading and writing files.
    - **Commands**:
        - `save_note(path: String, content: String)`: Writes the note content to the specified file path.
        - `load_note(path: String)`: Reads the content of a note from a file and returns it to the frontend.
        - `list_notes()`: Returns a list of all `.md` files in the notes directory.
- **Autosave Logic**:
    - A timer will be initiated on the frontend. On each tick, if the content is "dirty," it will call the `save_note` command.
    - The `onblur` event on the text area will also trigger the `save_note` command.
- **Storage**:
    - Notes will be stored as individual `.md` files in a dedicated application directory (e.g., `~/.vaultnote/notes` or the path returned by `tauri::api::path::app_data_dir`). This path will be managed on the Rust side to ensure consistency and security.

## 4. Best Practices

- **Security**: File system access will be strictly scoped to the application's data directory using Tauri's `allowlist` configuration in `tauri.conf.json`. This prevents the application from accessing unauthorized files.
- **Error Handling**: All Rust functions handling file I/O will return a `Result<(), String>` to properly propagate errors (e.g., file not found, permission denied) to the frontend, where they can be displayed to the user in a friendly format.
- **Performance**: To avoid UI blocking, markdown parsing and file I/O will be handled asynchronously in Rust. The live preview update on the frontend will be debounced to prevent excessive calls to the backend during rapid typing.

## 5. What to Avoid (Initial Version)

- **Complex Editor Features**: WYSIWYG controls, collaborative editing, and version history are out of scope for the initial implementation.
- **Unrestricted File Access**: The editor will not allow opening or saving files outside its designated notes directory to maintain a secure sandbox.

## 6. Future Enhancements

- Implement a file tree or list view to manage multiple notes.
- Add search and tagging functionality.
- Introduce optional note encryption using a Rust crypto library.

## 7. Learning Focus

- **Rust**: Mastering file I/O (`std::fs`), error handling with `Result` and `Box<dyn Error>`, and integrating external crates (`pulldown-cmark`).
- **Tauri**: Understanding the command system for frontend-backend communication and using the file system and path APIs.
- **SvelteKit**: Building reactive components with Runes (`$state`, `$derived`, `$effect`), and handling user events.