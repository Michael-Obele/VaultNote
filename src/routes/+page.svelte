<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Input } from "$lib/components/ui/input";
  import { invoke } from "@tauri-apps/api/core";
  import { toast } from "svelte-sonner";
  import { liveQuery } from "dexie";
  import { db, type Note } from "$lib/db";
  import { Save, Trash2, PlusCircle, Pen } from "@lucide/svelte";
  import { globalUiState } from "$lib/state.svelte";
  import markdownit from "markdown-it";
  import { Carta, MarkdownEditor, Markdown } from "carta-md";
  import { code } from "@cartamd/plugin-code";
  import { slash } from "@cartamd/plugin-slash";
  import "carta-md/default.css";
  import "github-markdown-css";
  import "@cartamd/plugin-code/default.css";
  import "@cartamd/plugin-slash/default.css";
  import { browser } from "$app/environment";
  import type { Attachment } from "svelte/attachments";
  import FileTree from "$lib/components/file-tree/FileTree.svelte";

  let selectedNote = $state<Note | null>(null);
  let newNoteTitle = $state("");
  let editorContent = $state("");
  let editorTitle = $state("");
  let editingTitle = $state(false);
  // Replaced local state with global state for command palette access
  // let createNoteDialogOpen = $state(false);
  // Autosave settings
  let autosaveEnabled = $state(true);
  const autosaveDelay = 3000; // milliseconds
  let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  let frozenNoteContent = $state<string | null>(null);

  const md = markdownit({
    html: true,
    linkify: true,
    breaks: true,
    typographer: true,
  });

  let notes = liveQuery(() =>
    db.notes.orderBy("updatedAt").reverse().toArray()
  );

  $effect(() => {
    if ($notes && !selectedNote) {
      selectNote($notes[0]);
    }
  });

  const selectNote = (note: Note | undefined) => {
    if (!note) {
      selectedNote = null;
      editorTitle = "";
      editorContent = "";
      return;
    }
    selectedNote = note;
    editorTitle = note.title;
    editorContent = note.content || "";
    frozenNoteContent = structuredClone(note.content);
    editingTitle = false;
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }
    try {
      const newId = await db.notes.add({
        title: newNoteTitle,
        content: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const newNoteRecord = await db.notes.get(newId);
      if (newNoteRecord) {
        newNoteTitle = "";
        toast.success("Note created!");
        selectNote(newNoteRecord);
        globalUiState.isCreateNoteDialogOpen = false;
      }
    } catch (e) {
      toast.error("Failed to create note: " + e);
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    if (!editorTitle.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }
    try {
      await db.notes.update(selectedNote.id, {
        title: editorTitle,
        content: editorContent,
        updatedAt: new Date(),
      });
      toast.success("Note saved!");
      editingTitle = false;
      // Keep in-memory state in sync so compare-before-save works reliably
      frozenNoteContent = structuredClone(editorContent);
      selectedNote = {
        ...selectedNote,
        title: editorTitle,
        content: editorContent,
        updatedAt: new Date(),
      };
    } catch (e) {
      toast.error("Failed to save note: " + e);
    }
  };

  // Helper: true when editor has unsaved changes compared to frozen (saved) content
  const hasUnsavedChanges = () =>
    !!selectedNote && editorContent !== (frozenNoteContent ?? "");

  // Save only when content changed compared to frozenNoteContent
  const saveIfChanged = async () => {
    if (!selectedNote) return;
    if (!hasUnsavedChanges) return; // nothing changed
    if (!editorTitle.trim()) {
      toast.error("Title cannot be empty.");
      return;
    }

    try {
      await db.notes.update(selectedNote.id, {
        title: editorTitle,
        content: editorContent,
        updatedAt: new Date(),
      });
      // Sync local copies
      frozenNoteContent = structuredClone(editorContent);
      selectedNote = {
        ...selectedNote,
        title: editorTitle,
        content: editorContent,
        updatedAt: new Date(),
      };
      toast.success("Note saved!");
      editingTitle = false;
    } catch (e) {
      toast.error("Failed to save note: " + e);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    try {
      await db.notes.delete(selectedNote.id);
      toast.success("Note deleted!");
      selectNote(undefined);
    } catch (e) {
      toast.error("Failed to delete note: " + e);
    }
  };

  let htmlPreview = $derived.by(async () => {
    if (!selectedNote || editorContent.trim() === "") {
      return '<p class="text-muted-foreground">Select a note or start typing...</p>';
    }
    try {
      // Left this here for Learning purposes, but using markdown-it directly now, don't remove!
      //   return await invoke<string>("parse_markdown", {
      //     txt: editorContent,
      //   });
      return md.render(editorContent);
    } catch (error) {
      console.warn(
        'Tauri command "parse_markdown" not available. Using simple fallback.'
      );
      return editorContent
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br />");
    }
  });

  const carta = new Carta({
    sanitizer: false, // Use a sanitizer in production to prevent XSS
    extensions: [code({ theme: "github-light" }), slash()],
    shikiOptions: {
      themes: ["github-light", "github-dark"],
    },
  });

  // Autosave effect: debounce unsaved changes (compare to frozenNoteContent) and call saveIfChanged
  $effect(() => {
    // Touch reactive inputs so this effect re-runs when they change
    void editorContent;
    void frozenNoteContent;
    void selectedNote;

    // Only run in browser and when autosave is enabled and a note is selected
    if (!browser) return;
    if (!autosaveEnabled || !selectedNote) return;

    // Clear existing timer
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }

    // If there are no unsaved changes, nothing to do
    if (!hasUnsavedChanges()) return;

    // Start debounce timer to save when user pauses
    autosaveTimer = setTimeout(() => {
      // Fire-and-forget; saveIfChanged will check again
      void saveIfChanged();
      autosaveTimer = null;
    }, autosaveDelay);

    return () => {
      if (autosaveTimer) {
        clearTimeout(autosaveTimer);
        autosaveTimer = null;
      }
    };
  });

  const myAttachment: Attachment = (element) => {
    console.log(element.nodeName);

    return () => {
      console.log("cleaning up");
    };
  };

  $inspect(!hasUnsavedChanges() ? "No changes" : "Unsaved changes");
</script>

<!-- Main layout container: Uses flexbox for responsiveness -->
<!-- On small screens (default), it's a single column (grid-cols-1). -->
<!-- On medium screens (md breakpoint) and larger, it becomes a two-column layout: -->
<!-- 280px fixed-width sidebar for notes and a flexible 1fr for the main content. -->
<div class="grid h-full w-full grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
  <!-- Left sidebar for notes list -->
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Notes</h2>
      <!-- Button to open the "Create New Note" dialog -->
      <Button
        variant="ghost"
        size="icon"
        onclick={() => (globalUiState.isCreateNoteDialogOpen = true)}
      >
        <PlusCircle class="h-5 w-5" />
        <span class="sr-only">New Note</span>
      </Button>
    </div>
    <!-- Scrollable container for the list of notes -->
    <div class="flex-1 overflow-auto rounded-lg border">
      <div class="p-2 border-b mb-2">
        <h3 class="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Explorer</h3>
        <FileTree onSelect={(path) => toast.info(`Selected file: ${path}`)} />
      </div>
      <div class="grid gap-1 p-2">
        <h3 class="text-xs font-semibold mb-1 px-2 text-muted-foreground uppercase tracking-wider">All Notes</h3>
        <!-- Conditional rendering: Only show notes if they exist -->
        {#if $notes}
          <!-- Loop through each note to create a clickable button -->
          {#each $notes as note (note.id)}
            <Button
              variant={selectedNote?.id === note.id ? "secondary" : "ghost"}
              class="justify-start"
              onclick={() => selectNote(note)}
            >
              {note.title}
            </Button>
          {/each}
        {/if}
      </div>
    </div>
  </div>
  <!-- Right main content area: Editor and Preview panes -->
  <!-- Conditionally rendered based on whether a note is selected -->
  {#if selectedNote}
    <!-- Grid for Editor and Preview cards: Stacks on small screens, two columns on medium screens and up -->
    <div class="grid h-full flex-1 grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Editor Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <div class="flex items-center justify-between">
            {#if editingTitle}
              <Input
                bind:value={editorTitle}
                onkeydown={(e) => {
                  if (e.key === "Enter") handleUpdateNote(); // Save on Enter
                  if (e.key === "Escape") editingTitle = false; // Cancel editing on Escape
                }}
                onblur={() => (editingTitle = false)}
                class="h-8"
                autofocus
              />
            {:else}
              <CardTitle
                class="cursor-pointer"
                onclick={() => (editingTitle = true)}
              >
                {editorTitle}
                <Pen class="ml-2 inline h-4 w-4 text-muted-foreground" />
              </CardTitle>
            {/if}
            <!-- Action buttons: Save, Toggle Autosave and Delete Note -->
            <div class="flex items-center gap-2">
              <Button size="sm" onclick={handleUpdateNote}
                ><Save class="mr-2 h-4 w-4" /> Save</Button
              >
              <Button
                size="sm"
                variant={autosaveEnabled ? "secondary" : "ghost"}
                onclick={() => (autosaveEnabled = !autosaveEnabled)}
                title={autosaveEnabled ? "Autosave: On" : "Autosave: Off"}
              >
                {#if autosaveEnabled}
                  Auto
                {:else}
                  Auto Off
                {/if}
              </Button>
              <Button variant="destructive" size="sm" onclick={handleDeleteNote}
                ><Trash2 class="mr-2 h-4 w-4" /> Delete</Button
              >
            </div>
          </div>
        </CardHeader>
        <CardContent class="flex-1 pt-0">
          <!-- Textarea for markdown content editing -->
          <Textarea
            bind:value={editorContent}
            {@attach myAttachment}
            placeholder="Write your markdown here..."
            class="h-full w-full resize-none border-0 p-0 font-mono focus-visible:ring-0"
          />
        </CardContent>
      </Card>
      <!-- Preview Card -->
      <Card class="flex flex-col">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent class="flex-1 pt-0">
          {#if !editorContent.trim()}
            <p class="text-muted-foreground">
              Select a note or start typing...
            </p>
          {:else}
            {#key editorContent}
              <Markdown {carta} value={editorContent} />
            {/key}
          {/if}
        </CardContent>
      </Card>
    </div>
  {:else}
    <!-- Message displayed when no note is selected -->
    <div
      class="md:col-span-2 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
    >
      <h3 class="text-2xl font-bold tracking-tight">No Note Selected</h3>
      <p class="text-sm text-muted-foreground">
        Select a note from the list or create a new one.
      </p>
    </div>
  {/if}
</div>

<!-- Dialog for creating a new note -->
<Dialog.Root bind:open={globalUiState.isCreateNoteDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Create a new note</Dialog.Title>
      <Dialog.Description>
        Enter a title below to get started.
      </Dialog.Description>
    </Dialog.Header>
    <!-- Form for new note creation -->
    <form
      class="flex w-full items-center gap-2 pt-4"
      onsubmit={(e) => {
        e.preventDefault(); // Prevent default form submission
        handleCreateNote();
      }}
    >
      <Input bind:value={newNoteTitle} placeholder="My awesome note" />
      <Button type="submit">Create</Button>
    </form>
  </Dialog.Content>
</Dialog.Root>

<style global>
  /* Editor dark mode */
  /* Only if you are using the default theme */
  :global(.dark .carta-theme__default) {
    --border-color: var(--border-color-dark);
    --selection-color: var(--selection-color-dark);
    --focus-outline: var(--focus-outline-dark);
    --hover-color: var(--hover-color-dark);
    --caret-color: var(--caret-color-dark);
    --text-color: var(--text-color-dark);
  }

  /* Code dark mode */
  /* Only if you didn't specify a custom code theme */
  /* Shiki / Carta can include highly-specific CSS; provide a fallback so pre/code
	   and shiki elements follow the app theme variables (background/text). */
  :global(.shiki),
  :global(.shiki span),
  :global(pre[class*="language-"]),
  :global(code[class*="language-"]),
  :global(.carta-renderer pre),
  :global(.carta-renderer code) {
    background-color: var(--color-background) !important;
    color: var(--text-color) !important;
  }

  /* Ensure tables inside the renderer use the theme colors */
  :global(.carta-renderer table),
  :global(.markdown-body table) {
    background-color: var(--color-background) !important;
    color: var(--color-foreground) !important;
  }

  :global(.markdown-body) {
    box-sizing: border-box;
    min-width: 100px;
    max-width: 980px;
    margin: 0 auto;
    padding: 45px;
    background-color: var(--color-background);

    @media (max-width: 767px) {
      padding: 15px;
    }
  }

  :global {
    .carta-input,
    .carta-renderer {
      min-height: 120px;
      max-height: 60vh;
      overflow: auto;
    }
    .carta-renderer {
      background-color: var(--color-background);
      color: var(--text-color);
    }
  }

  /* Strong overrides to prevent vendor @media(prefers-color-scheme: dark) styles
   from forcing a dark palette inside the preview. We map common GitHub/Shiki
   variables to our app variables and force background/color so the preview
   follows the site theme (html .dark) rather than OS media queries. */
  :global(.markdown-body),
  :global(.carta-renderer) {
    /* Force the app theme colors for the preview */
    background-color: var(--color-background) !important;
    color: var(--color-foreground) !important;

    /* Map commonly-used vendor variables to our app vars so token CSS resolves
	   to the correct colors regardless of media queries. */
    --fgColor-default: var(--color-foreground) !important;
    --fgColor-muted: var(--color-foreground) !important;
    --shiki-dark: var(--color-foreground) !important;
    --shiki-dark-bg: var(--color-background) !important;
    --shiki-light: var(--color-foreground) !important;
    --shiki-light-bg: var(--color-background) !important;
    --bgColor-default: var(--color-background) !important;
    --bgColor-muted: var(--color-background) !important;
    --borderColor-default: var(--border-color, rgba(0, 0, 0, 0.12)) !important;
  }

  /* Respect site-driven theme switch (html.dark). These selectors ensure the
   preview's color-scheme hint and variables follow the site class, not OS. */
  html.dark :global(.markdown-body),
  html.dark :global(.carta-renderer),
  [data-theme="dark"] :global(.markdown-body),
  [data-theme="dark"] :global(.carta-renderer) {
    color-scheme: dark !important;
    background-color: var(--color-background) !important;
    color: var(--color-foreground) !important;
  }

  html:not(.dark) :global(.markdown-body),
  html:not(.dark) :global(.carta-renderer),
  :not([data-theme="dark"]) :global(.markdown-body),
  :not([data-theme="dark"]) :global(.carta-renderer) {
    color-scheme: light !important;
    background-color: var(--color-background) !important;
    color: var(--color-foreground) !important;
  }
</style>
