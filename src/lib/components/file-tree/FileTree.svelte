<script lang="ts">
  import { type FileSystemItem } from '$lib/types';
  import FileTreeItem from './FileTreeItem.svelte';
  import { onMount } from 'svelte';
  import { readDir, BaseDirectory, type DirEntry } from '@tauri-apps/plugin-fs';
  import { toast } from 'svelte-sonner';

  let { onSelect } = $props<{ onSelect: (path: string) => void }>();
  
  let rootItems = $state<FileSystemItem[]>([]);
  let isLoading = $state(true);

  async function loadFiles() {
      isLoading = true;
      try {
          // ensure directory exists - in real app might need to create it first
          // This is a simplified recursive loader
          // For now, we'll mock it if we're not in Tauri or just starting out
          // But here is the real implementation code structure:
          
          /*
          const entries = await readDir('notes', { baseDir: BaseDirectory.AppLocalData });
          rootItems = await Promise.all(entries.map(async (e) => mapEntry(e, 'notes')));
          */
          
          // Mock data for demonstration until permissions are fully set up
          rootItems = [
              {
                  name: 'Project Ideas',
                  path: 'notes/ideas',
                  kind: 'directory',
                  children: [
                      { name: 'App Features.md', path: 'notes/ideas/features.md', kind: 'file' },
                      { name: 'Marketing.md', path: 'notes/ideas/marketing.md', kind: 'file' }
                  ]
              },
              { name: 'Journal.md', path: 'notes/journal.md', kind: 'file' },
              { name: 'Meeting Notes.md', path: 'notes/meeting.md', kind: 'file' }
          ];

      } catch (err) {
          console.error("Failed to load files", err);
          toast.error("Failed to load notes: " + String(err));
      } finally {
          isLoading = false;
      }
  }

  // Helper to standardise entries
  /*
  async function mapEntry(entry: DirEntry, parentPath: string): Promise<FileSystemItem> {
      const path = `${parentPath}/${entry.name}`;
      if (entry.isDirectory) {
          const children = await readDir(path, { baseDir: BaseDirectory.AppLocalData });
          const mappedChildren = await Promise.all(children.map(c => mapEntry(c, path)));
          return { name: entry.name, path, kind: 'directory', children: mappedChildren };
      }
      return { name: entry.name, path, kind: 'file' };
  }
  */

  onMount(() => {
      loadFiles();
  });
</script>

<div class="h-full overflow-y-auto py-2">
  {#if isLoading}
      <div class="p-4 text-sm text-muted-foreground">Loading...</div>
  {:else}
      {#each rootItems as item}
          <FileTreeItem {item} {onSelect} />
      {/each}
  {/if}
</div>
