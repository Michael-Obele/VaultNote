<script module>
    // module-level logic goes here
    // (you will rarely use this)
    console.log("This was mounted");

    // import type { PageLoad } from './$types';
    import { marked } from "marked";
    let text = "A test text";
</script>

<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Textarea } from "$lib/components/ui/textarea";
    import { invoke } from "@tauri-apps/api/core";
    import { toast } from "svelte-sonner";

    let { data } = $props();
    console.info(text);

    // State for the markdown editor
    let markdownContent = $state("");

    // Derived state for the HTML preview
    // NOTE: $derived.by is used for async derivations.
    let htmlPreview = $derived.by(async () => {
        if (markdownContent.trim() === "") {
            return '<p class="text-muted-foreground">Start typing to see a preview...</p>';
        }
        try {
            // This will eventually call our Rust backend for robust parsing.
            // The command name 'parse_markdown' is from our plan.
            const html: string = await invoke("parse_markdown", {
                txt: markdownContent,
            });
            // const html = marked.parse(markdownContent);
            return html;
        } catch (error) {
            // If the backend isn't connected yet, this will fail.
            // We can provide a simple fallback for frontend-only development.
            console.warn(
                'Tauri command "parse_markdown" not available. Using simple fallback parser.',
            );
            return markdownContent
                .replace(/^# (.*$)/gim, "<h1>$1</h1>")
                .replace(/^## (.*$)/gim, "<h2>$1</h2>")
                .replace(/^### (.*$)/gim, "<h3>$1</h3>")
                .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
                .replace(/\*(.*)\*/gim, "<em>$1</em>")
                .replace(/`(.*?)`/g, "<code>$1</code>")
                .replace(/\n/g, "<br />");
        }
    });
    let saveState: string = $state("");
    const saveNote = async () => {
        saveState = await invoke("save_note");
        toast(saveState);
        console.log(saveState);
    };
</script>

<div class="flex h-full flex-col gap-4">
    <header class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">Markdown Editor</h1>
        <div class="flex items-center gap-2">
            <Button variant="outline">Load Note</Button>
            <Button onclick={() => saveNote()}>Save Note</Button>
        </div>
    </header>
    <div class="grid h-full flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        <Card class="flex flex-col">
            <CardHeader>
                <CardTitle>Editor</CardTitle>
            </CardHeader>
            <CardContent class="flex-1 pt-0">
                <Textarea
                    bind:value={markdownContent}
                    placeholder="Write your markdown here..."
                    class="h-full w-full resize-none border-0 p-0 font-mono focus-visible:ring-0"
                />
            </CardContent>
        </Card>
        <Card class="flex flex-col">
            <CardHeader>
                <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent class="flex-1 pt-0">
                {#await htmlPreview}
                    <p class="text-muted-foreground">Generating preview...</p>
                {:then html}
                    <div class="prose prose-sm dark:prose-invert max-w-none">
                        {@html html}
                    </div>
                {:catch error}
                    <p class="text-destructive">{error.message}</p>
                {/await}
            </CardContent>
        </Card>
    </div>
</div>

<style>
    /* Basic prose styles for the preview pane */
    .prose :global(h1) {
        font-size: 1.875rem;
        font-weight: 700;
        margin-top: 0;
    }
    .prose :global(h2) {
        font-size: 1.5rem;
        font-weight: 600;
    }
    .prose :global(h3) {
        font-size: 1.25rem;
        font-weight: 600;
    }
    .prose :global(code) {
        background-color: hsl(var(--muted));
        color: hsl(var(--muted-foreground));
        padding: 0.2em 0.4em;
        border-radius: 0.3rem;
        font-size: 85%;
    }
</style>
