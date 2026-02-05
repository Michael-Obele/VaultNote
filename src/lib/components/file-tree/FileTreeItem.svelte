<script lang="ts">
  import { type FileSystemItem } from "$lib/types";
  import { Folder, File, ChevronRight, ChevronDown } from "@lucide/svelte";
  import Self from "./FileTreeItem.svelte";

  let {
    item,
    onSelect,
    level = 0,
  } = $props<{
    item: FileSystemItem;
    onSelect: (path: string) => void;
    level?: number;
  }>();

  let isOpen = $state(false);

  function toggle() {
    if (item.kind === "directory") isOpen = !isOpen;
    else onSelect(item.path);
  }
</script>

<div class="w-full">
  <button
    onclick={toggle}
    class="flex items-center gap-2 hover:bg-accent/50 w-full p-1 rounded text-sm transition-colors"
    style="padding-left: {level * 12 + 4}px"
  >
    {#if item.kind === "directory"}
      <span class="text-muted-foreground">
        {#if isOpen}
          <ChevronDown class="size-4" />
        {:else}
          <ChevronRight class="size-4" />
        {/if}
      </span>
      <Folder class="size-4 text-blue-400 fill-blue-400/20" />
    {:else}
      <span class="w-4"></span>
      <File class="size-4 text-muted-foreground" />
    {/if}
    <span class="truncate">{item.name}</span>
  </button>

  {#if isOpen && item.children}
    <div class="w-full border-l border-border/50 ml-[11px]">
      {#each item.children as child}
        <Self item={child} {onSelect} level={level + 1} />
      {/each}
    </div>
  {/if}
</div>
