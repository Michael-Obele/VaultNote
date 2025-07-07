<script lang="ts">
    import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { db, type Settings } from "$lib/db";
    import { liveQuery } from "dexie";
    import { onMount } from "svelte";
    import * as Select from "$lib/components/ui/select"; // Import as namespace for consistency with docs
    import { setMode } from "mode-watcher";
    import { selectedTheme } from "$lib/state.svelte";
    // Reactive store for settings, initialized with liveQuery
    const settingsStore = liveQuery(() => db.settings.get(1));

    const themeOptions = [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "system", label: "System" },
    ];

    let isInitialLoad = true; // Flag to prevent saving on initial load

    const triggerContent = $derived(
        themeOptions.find((t) => t.value === selectedTheme.current)?.label ??
            "Select a theme",
    );

    // Function to update the theme in the database
    async function updateThemeInDb(newTheme: "light" | "dark" | "system") {
        try {
            // Fetch the current setting from DB to compare and avoid unnecessary writes
            const existingSetting = await db.settings.get(1);

            if (existingSetting) {
                if (existingSetting.theme !== newTheme) {
                    await db.settings.update(1, { theme: newTheme });
                    setMode(newTheme); // Set the new theme
                    console.log(`Theme updated to: ${newTheme}`);
                }
            } else {
                // This branch should primarily be hit by onMount, but as a fallback
                await db.settings.add({ id: 1, theme: newTheme });
                setMode(newTheme); // Set the initial theme
                console.log(`Initial theme setting added: ${newTheme}`);
            }
        } catch (error) {
            console.error("Failed to update theme:", error);
        }
    }

    // Effect to react to changes in the database settings and populate selectedTheme
    // $effect(() => {
    //     // const fetchedSettings = $settingsStore;
    //     // if (fetchedSettings) {
    //     //     // Only update if the fetched theme is different from the current selectedTheme
    //     //     if (selectedTheme !== fetchedSettings.theme) {
    //     //         selectedTheme = fetchedSettings.theme;
    //     //         setMode(fetchedSettings.theme); // Synchronize theme with mode-watcher
    //     //     }
    //     //     isInitialLoad = false; // Initial load from DB is complete
    //     // }
    //     // setMode(selectedTheme);
    // });

    // Effect to save selectedTheme to the database when it changes due to user interaction
    $effect(() => {
        // Only save if it's not the initial load and selectedTheme has a value
        if (selectedTheme.current) {
            updateThemeInDb(selectedTheme.current);
        }
    });

    // Initialize default settings if they don't exist when the component mounts
    onMount(async () => {
        const existingSettings = await db.settings.get(1);
        if (!existingSettings) {
            // Set initial theme in DB if none exists. This will also update settingsStore and selectedTheme.
            await db.settings.add({ id: 1, theme: "system" });
        }
    });
</script>

<div class="flex h-full flex-col gap-4">
    <header>
        <h1 class="text-2xl font-bold">Settings</h1>
    </header>
    <Card class="flex-1">
        <CardHeader>
            <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                    <label
                        for="theme-select"
                        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >Theme</label
                    >
                    <!-- Use selected={selectedTheme} and onSelectedChange to handle updates -->
                    <Select.Root
                        type="single"
                        name="theme"
                        bind:value={selectedTheme.current}
                    >
                        <Select.Trigger id="theme-select" class="w-[180px]">
                            {triggerContent}
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Group>
                                <Select.Label>Theme</Select.Label>
                                {#each themeOptions as theme (theme.value)}
                                    <Select.Item
                                        value={theme.value}
                                        label={theme.label}
                                    >
                                        {theme.label}
                                    </Select.Item>
                                {/each}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </div>
            </div>
        </CardContent>
    </Card>
</div>
