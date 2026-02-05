# Feature: Clipboard Manager

## 1. Description

This feature provides a clipboard manager that monitors the system's clipboard, stores a history of copied items, and allows the user to easily access, reuse, and manage them within the VaultNote application.

## 2. Core Functionality

- **Clipboard Monitoring**: The application will automatically detect and capture new text content copied to the system clipboard.
- **History Display**: A list of recent clipboard items will be displayed in a dedicated UI panel, showing a preview of the content.
- **Snippet Management**: Users can select an item from the history to copy it back to the clipboard.
- **Integration with Editor**: Users can insert a clipboard item directly into the active note in the markdown editor.
- **History Limit**: The manager will store a fixed number of recent items (e.g., 20) to prevent excessive memory usage.

## 3. Technical Implementation

### Backend (Rust & Tauri)

- **Clipboard Access**:
    - The `arboard` crate is a robust choice for cross-platform clipboard management in Rust. It can be used to read text from the clipboard.
    - A background task will be spawned using Rust's `std::thread` or an async runtime like `tokio`. This task will periodically poll the clipboard for changes.
- **State Management**:
    - A `Tauri` managed state will hold the clipboard history. A `Mutex<VecDeque<String>>` is a suitable data structure for this, ensuring thread-safe access and efficient addition/removal of items from both ends.
    - The `VecDeque` will be capped at a specific size. When a new item is added and the capacity is reached, the oldest item will be removed.
- **Backend-to-Frontend Communication**:
    - When the clipboard history is updated, the backend will emit an event to the frontend using `window.emit()`. This is more efficient than having the frontend constantly poll for changes.
- **Tauri Commands**:
    - `#[tauri::command] async fn get_clipboard_history(state: tauri::State<'_, AppState>) -> Vec<String>`: Retrieves the current clipboard history.
    - `#[tauri::command] async fn set_clipboard_content(content: String)`: Sets the system clipboard's content to the provided string.
    - `#[tauri::command] async fn clear_clipboard_history(state: tauri::State<'_, AppState>)`: Clears all items from the history.

### Frontend (SvelteKit)

- **Component Structure**:
    - `ClipboardManagerView.svelte`: The main container component that listens for backend events and displays the list of clipboard items.
    - `ClipboardItem.svelte`: A component representing a single item in the history list. It will display the text snippet and have buttons for "Copy" and "Insert into Note".
- **Event Handling**:
    - A `$effect` in `ClipboardManagerView` will set up a listener for the `clipboard-updated` event from the backend using Tauri's `listen` function. The effect will return a teardown function to unsubscribe from the listener when the component is destroyed. The received data will update a reactive `$state` variable holding the history.
- **User Interaction**:
    - A click on the "Copy" button on a `ClipboardItem` (`onclick`) will invoke the `set_clipboard_content` command with the item's text.
    - The `ClipboardItem` will accept an `onInsert` function as a prop. Clicking "Insert into Note" will call this function, passing the content up to the parent component to be inserted into the editor.

## 4. Best Practices

- **Performance**: The clipboard polling interval in the Rust backend should be configurable and reasonable (e.g., every 1-2 seconds) to balance responsiveness and system resource usage.
- **Security**:
    - The application should not persist clipboard history to disk by default to protect sensitive information.
    - A future enhancement could be to add a "pause" or "incognito" mode to temporarily stop monitoring the clipboard.
- **Data Handling**: Avoid storing duplicate consecutive entries. Before adding a new item to the history, check if it's the same as the most recent one.

## 5. What to Avoid (Initial Version)

- **Non-Text Content**: The initial version will only support text. Image and file support will be deferred.
- **Persistence**: History will be in-memory only and will be cleared when the application closes.
- **Search and Filtering**: Advanced features like searching the clipboard history or filtering by content type are out of scope for the first iteration.

## 6. Future Enhancements

- **Persistent History**: Add an option to save clipboard history to a local, possibly encrypted, database (e.g., SQLite).
- **Search Functionality**: Allow users to search through their clipboard history.
- **Support for Images**: Capture and display images from the clipboard.
- **Favorite Snippets**: Allow users to "pin" or "favorite" frequently used snippets so they are not removed when the history limit is reached.

## 7. Learning Focus

- **Rust**: Concurrency with `std::thread`, thread-safe state management with `Mutex`, and using external crates (`arboard`).
- **Tauri**: Managing global state (`tauri::State`), the event system for backend-to-frontend communication, and creating background tasks.
- **SvelteKit**: Listening to backend events with `$effect`, managing state with Runes (`$state`), and handling inter-component communication using callback props.