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
  import markdownit from "markdown-it";

  let selectedNote = $state<Note | null>(null);
  let newNoteTitle = $state("");
  let editorContent = $state("");
  let editorTitle = $state("");
  let editingTitle = $state(false);
  let createNoteDialogOpen = $state(false);

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
        createNoteDialogOpen = false;
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
        onclick={() => (createNoteDialogOpen = true)}
      >
        <PlusCircle class="h-5 w-5" />
        <span class="sr-only">New Note</span>
      </Button>
    </div>
    <!-- Scrollable container for the list of notes -->
    <div class="flex-1 overflow-auto rounded-lg border">
      <div class="grid gap-1 p-2">
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
            <!-- Conditional rendering for note title: Input field when editing, CardTitle when not -->
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
            <!-- Action buttons: Save and Delete Note -->
            <div class="flex items-center gap-2">
              <Button size="sm" onclick={handleUpdateNote}
                ><Save class="mr-2 h-4 w-4" /> Save</Button
              >
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
          <!-- Svelte's #await block for handling asynchronous htmlPreview -->
          {#await htmlPreview}
            <p class="text-muted-foreground">Generating preview...</p>
          {:then html}
            <!-- Render the HTML preview, applying prose styles for readability -->
            <div class="prose prose-sm dark:prose-invert max-w-none">
              {@html html}
            </div>
          {:catch error}
            <p class="text-destructive">{error.message}</p>
          {/await}
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
<Dialog.Root bind:open={createNoteDialogOpen}>
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

<style>
  /* Basic prose styles for the markdown preview pane */
  /* These styles ensure rendered markdown looks good within the application. */
  .prose :global(h1) {
    font-size: 1.875rem;
    font-weight: 700;
    margin-top: 1.5em; /* Added margin-top */
    margin-bottom: 0.75em; /* Added margin-bottom */
  }
  .prose :global(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.25em; /* Added margin-top */
    margin-bottom: 0.6em; /* Added margin-bottom */
  }
  .prose :global(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin-top: 1em; /* Added margin-top */
    margin-bottom: 0.5em; /* Added margin-bottom */
  }
  .prose :global(code) {
    background-color: hsl(var(--muted));
    color: hsl(var(--muted-foreground));
    padding: 0.2em 0.4em;
    border-radius: 0.3rem;
    font-size: 85%;
  }

  .prose :global(pre) {
    background-color: hsl(
      var(--muted)
    ); /* Use muted background for code blocks */
    color: hsl(
      var(--muted-foreground)
    ); /* Use muted foreground for text color */
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    white-space: pre-wrap; /* Ensures text wraps within the pre block */
    word-break: break-all; /* Breaks long words to prevent overflow */
  }

  .prose :global(pre code) {
    background-color: transparent; /* Inherit from pre */
    color: inherit; /* Inherit from pre */
    padding: 0;
    border-radius: 0;
    font-size: inherit;
  }
</style>
