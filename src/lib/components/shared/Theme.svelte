<script lang="ts">
    import SunIcon from "@lucide/svelte/icons/sun";
    import MoonIcon from "@lucide/svelte/icons/moon";
    import { selectedTheme } from "$lib/state.svelte";
    import { toggleMode } from "mode-watcher";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Computer } from "@lucide/svelte";
    import { resetMode, setMode } from "mode-watcher";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { buttonVariants } from "$lib/components/ui/button/index.js";

    const switchTheme = (theme: "light" | "dark" | "system") => {
        selectedTheme.current = theme;
        // setMode(theme);
    };
</script>

<!-- <Button onclick={toggleMode} variant="outline" size="icon">
    {#if selectedTheme.current === "system"}
        <Computer
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all"
        />
    {:else}
        <SunIcon
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
        />
        <MoonIcon
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
        />
    {/if}
    <span class="sr-only">Toggle theme</span>
</Button> -->

<DropdownMenu.Root>
    <DropdownMenu.Trigger
        class={buttonVariants({ variant: "outline", size: "icon" })}
    >
        {#if selectedTheme.current === "system"}
            <Computer
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all"
            />
        {:else}
            <SunIcon
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
            />
            <MoonIcon
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
            />
        {/if}
        <span class="sr-only">Toggle theme</span>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content side="right" align="end">
        <DropdownMenu.Item onclick={() => switchTheme("light")}
            >Light</DropdownMenu.Item
        >
        <DropdownMenu.Item onclick={() => switchTheme("dark")}
            >Dark</DropdownMenu.Item
        >
        <DropdownMenu.Item onclick={() => switchTheme("system")}
            >System</DropdownMenu.Item
        >
    </DropdownMenu.Content>
</DropdownMenu.Root>
