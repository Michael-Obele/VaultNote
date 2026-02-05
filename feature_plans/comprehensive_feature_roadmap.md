# Comprehensive Feature Roadmap & Implementation Plan

This document outlines the roadmap for future features of **VaultNote**, focusing on functionality that extends the core implementation. It details architectural decisions, design choices using `shadcn-svelte`, and code patterns following Svelte 5 best practices.

## 1. Advanced Organization: Tagging & Folders

**Goal**: Move beyond a flat list of notes to a structured system using a file-tree metaphor and flexible tagging.

### Design Choices

- **UI Component**: Custom Recursive Tree View for folders.
- **State Management**: Svelte 5 `$state` proxy for the nested directory structure.
- **Backend**: `tauri-plugin-fs` to map local directories to the UI.

### Implementation Details

#### Data Structure

Instead of a flat array, we will maintain a recursive type for the file tree.

```typescript
type FileSystemItem = {
  name: string;
  path: string;
  kind: "file" | "directory";
  children?: FileSystemItem[]; // only for directories
};
```

#### Svelte 5 Recursive Component (`FileTreeItem.svelte`)

```html
<script lang="ts">
  import { type FileSystemItem } from "$lib/types";
  import { Folder, File, ChevronRight, ChevronDown } from "@lucide/svelte";

  let { item, onSelect } = $props<{
    item: FileSystemItem;
    onSelect: (path: string) => void;
  }>();

  let isOpen = $state(false);

  function toggle() {
    if (item.kind === "directory") isOpen = !isOpen;
    else onSelect(item.path);
  }
</script>

<div class="pl-4">
  <button
    onclick="{toggle}"
    class="flex items-center gap-2 hover:bg-accent/50 w-full p-1 rounded"
  >
    {#if item.kind === 'directory'} {#if isOpen}
    <ChevronDown class="size-4" />
    <Folder class="size-4 text-blue-400" />
    {:else}
    <ChevronRight class="size-4" />
    <Folder class="size-4 text-blue-400" />
    {/if} {:else}
    <File class="size-4 text-gray-400" />
    {/if}
    <span>{item.name}</span>
  </button>

  {#if isOpen && item.children}
  <div class="border-l ml-2 border-border">
    {#each item.children as child}
    <FileTreeItem item="{child}" {onSelect} />
    {/each}
  </div>
  {/if}
</div>
```

## 2. Global Command Palette & Search

**Goal**: A `Ctrl+K` global search that allows navigation, running commands, and searching note content.

### Design Choices

- **Library**: `shadcn-svelte` **Command** component (based on `bits-ui` and `cmdk`).
- **Search Engine**: `FlexSearch` (lightweight JS) for in-memory note indexing, or raw Rust search via Tauri invoke if performance becomes an issue (>10k notes).
- **Triggers**: `Ctrl+K` / `Cmd+K`.

### Implementation Details

Using `shadcn-svelte`'s `Command.Dialog`.

```html
<script lang="ts">
  import * as Command from "$lib/components/ui/command";
  import { goto } from "$app/navigation";
  import { FileText, Search } from "@lucide/svelte";

  let open = $state(false);
  let value = $state("");

  // Toggle on Ctrl+K
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open = !open;
    }
  }

  // Handle selection
  function runCommand(id: string) {
    open = false;
    goto(`/note/${id}`);
  }
</script>

<svelte:document onkeydown="{handleKeydown}" />

<Command.Dialog bind:open>
  <Command.Input placeholder="Search notes..." bind:value />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Notes">
      <!-- Iterate over filtered notes -->
      <Command.Item value="Project Plan" onSelect="{()" ="">
        runCommand('project-plan')}>
        <FileText class="mr-2 size-4" />
        <span>Project Plan</span>
      </Command.Item>
    </Command.Group>

    <Command.Group heading="Actions">
      <Command.Item value="New Note">
        <span class="mr-2">+</span>
        <span>Create New Note</span>
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command.Dialog>
```

## 3. "Zen Mode" (Distraction-Free Writing)

**Goal**: Allow the user to collapse all sidebars and UI, focusing purely on the editor.

### Design Choices

- **Library**: `shadcn-svelte` **Resizable**.
- **Mechanism**: Programmatically controlling the `Resizable.Pane` default size or collapsing it.
- **Persisted State**: Remember layout preference.

### Implementation Layout

Structure the main `+layout.svelte` using Resizable Panels.

```html
<script lang="ts">
  import * as Resizable from "$lib/components/ui/resizable";
  let isSidebarOpen = $state(true);

  // Function to toggle sidebar (Zen Mode)
  function toggleZen() {
    isSidebarOpen = !isSidebarOpen;
  }
</script>

<Resizable.PaneGroup direction="horizontal">
  {#if isSidebarOpen}
  <Resizable.Pane defaultSize="{20}" minSize="{15}" maxSize="{30}">
    <Sidebar />
  </Resizable.Pane>
  <Resizable.Handle />
  {/if}

  <Resizable.Pane defaultSize="{80}">
    <div class="h-full w-full max-w-3xl mx-auto p-8">
      <!-- Main Editor Slot -->
      <slot />
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>
```

## 4. Security: Biometric Unlock

**Goal**: Secure the Password Vault (and optionally the whole app) using system biometrics (TouchID / Windows Hello).

### Dependencies

- `tauri-plugin-biometric` (Requires adding to `Cargo.toml` and capability registration).

### Implementation Flow

1.  **Check Availability**: On app mount, check `checkBioAuth availability`.
2.  **Prompt**: When accessing `/passwords` route, trigger the biometric prompt.
3.  **Fallback**: If fails, revert to Master Password.

```rust
// Rust Capability (src-tauri/capabilities/default.json)
{
  "permissions": [
    "biometric:allow-authenticate",
    "biometric:allow-check"
  ]
}
```

```typescript
// Svelte Service
import { authenticate } from "@tauri-apps/plugin-biometric";

async function unlockVault() {
  try {
    await authenticate("Unlock your vault");
    isUnlocked.value = true;
  } catch (e) {
    console.error("Biometric failed, use password", e);
  }
}
```

## 5. Data Persistence & Cloud Foundations

**Goal**: While currently local-only (Dexie/IndexedDB), we should prepare for filesystem-based syncing to support iCloud/Dropbox/Git syncing.

### Strategy

- **File System as Source of Truth**: Instead of keeping notes primarily in IndexedDB, write them as `.md` files to `app_data_dir/notes/`.
- **Indexing**: Use SQLite (`tauri-plugin-sql`) or Dexie only as a _cache_ for fast searching, but load content from disk. s
- **Benefit**: This allows external services (git, dropbox) to sync the files without the app needing complex sync logic.

### Rust-Side File Watcher

We can implement a file watcher in Rust (`notify` crate) to update the frontend when a file changes on disk (e.g., via a git pull).

```rust
// Conceptual Rust command
#[tauri::command]
fn watch_notes_dir(window: tauri::Window) {
    let mut watcher = notify::recommended_watcher(move |res| {
        match res {
           Ok(event) => window.emit("fs-change", event).unwrap(),
           Err(e) => println!("watch error: {:?}", e),
        }
    }).unwrap();
    // ... start watching
}
```

## 6. Graph View (Visualization)

**Goal**: Visualize connections between notes (Wiki-links `[[Link]]`).

### library Choice

- **D3.js**: Industry standard, highly customizable.
- **Force Graph**: Force-directed layout.

### Implementation Logic

1.  **Parse**: Regex scan all notes for `[[...]]` links.
2.  **Build Graph**: Create Nodes (Notes) and Edges (Links).
3.  **Render**: Svelte component wrapping a D3 simulation.

## Summary of Next Steps

1.  **Dependencies**: Add `shadcn-svelte` components (`command`, `resizable`, `sidebar`).
2.  **Refactor**: Migrate main layout to `resizable` panels.
3.  **Feature**: Implement `tauri-plugin-fs` based note loading to replace/augment Dexie.
4.  **UI**: Build the recursive file tree sidebar.
