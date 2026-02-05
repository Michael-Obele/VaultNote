<script lang="ts">
  import * as Command from "$lib/components/ui/command";
  import { goto } from "$app/navigation";
  import {
    FileText,
    Plus,
    Moon,
    Sun,
    Monitor,
    Lock,
    Clipboard,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { setMode } from "mode-watcher";
  import { globalUiState } from "$lib/state.svelte";

  let open = $state(false);
  let value = $state("");

  // Toggle on Ctrl+K
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open = !open;
    }
  }

  function runCommand(action: () => void) {
    open = false;
    action();
  }
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open>
  <Command.Input placeholder="Type a command or search..." bind:value />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>

    <Command.Group heading="Navigation">
      <Command.Item
        value="Go to Notes"
        onSelect={() => runCommand(() => goto("/"))}
      >
        <FileText class="mr-2 size-4" />
        <span>Notes</span>
      </Command.Item>
      <Command.Item
        value="Go to Clipboard"
        onSelect={() => runCommand(() => goto("/clipboard"))}
      >
        <Clipboard class="mr-2 size-4" />
        <span>Clipboard</span>
      </Command.Item>
      <Command.Item
        value="Go to Passwords"
        onSelect={() => runCommand(() => goto("/passwords"))}
      >
        <Lock class="mr-2 size-4" />
        <span>Passwords</span>
      </Command.Item>
    </Command.Group>

    <Command.Group heading="Actions">
      <Command.Item
        value="New Note"
        onSelect={() =>
          runCommand(() => {
            globalUiState.isCreateNoteDialogOpen = true;
          })}
      >
        <Plus class="mr-2 size-4" />
        <span>Create New Note</span>
      </Command.Item>
    </Command.Group>

    <Command.Group heading="Theme">
      <Command.Item
        value="Light Mode"
        onSelect={() => runCommand(() => setMode("light"))}
      >
        <Sun class="mr-2 size-4" />
        <span>Light Mode</span>
      </Command.Item>
      <Command.Item
        value="Dark Mode"
        onSelect={() => runCommand(() => setMode("dark"))}
      >
        <Moon class="mr-2 size-4" />
        <span>Dark Mode</span>
      </Command.Item>
      <Command.Item
        value="System Theme"
        onSelect={() => runCommand(() => setMode("system"))}
      >
        <Monitor class="mr-2 size-4" />
        <span>System Theme</span>
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command.Dialog>
