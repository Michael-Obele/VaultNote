<script lang="ts">
    import "../app.css";
    import { Toaster } from "$lib/components/ui/sonner";
    import {
        Tooltip,
        TooltipContent,
        TooltipProvider,
        TooltipTrigger,
    } from "$lib/components/ui/tooltip";
    import { Button } from "$lib/components/ui/button";
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import {
        ShieldCheck,
        NotebookPen,
        ClipboardList,
        Lock,
        Settings,
        LogOut,
    } from "@lucide/svelte";
    import { ModeWatcher } from "mode-watcher";
    import Theme from "$lib/components/shared/Theme.svelte";
    import Login from "$lib/components/Login.svelte";
    import { isAuthenticated } from "$lib/state.svelte";

    let { children } = $props();

    // --- Authentication State ---
    // For demonstration, we'll use a simple state. In a real app, this would
    // be derived from a store that checks for a valid session token.

    function handleLoginSuccess() {
        isAuthenticated.current = true;
    }

    function handleLogout() {
        isAuthenticated.current = false;
        // Optionally, clear session token from storage here
    }
</script>

<ModeWatcher />

<TooltipProvider>
    <div
        class="flex h-screen w-full bg-background font-sans text-foreground antialiased"
    >
        <aside class="inset-y fixed left-0 z-20 flex h-full flex-col border-r">
            <div class="border-b p-2">
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Home"
                    onclick={() => goto("/")}
                >
                    <ShieldCheck class="h-5 w-5" />
                </Button>
            </div>

            <nav class="grid gap-1 p-2">
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant={page.url.pathname === "/"
                                ? "secondary"
                                : "ghost"}
                            size="icon"
                            class="rounded-lg"
                            aria-label="Notes"
                            onclick={() => goto("/")}
                        >
                            <NotebookPen class="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}
                        >Notes</TooltipContent
                    >
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant={page.url.pathname === "/clipboard"
                                ? "secondary"
                                : "ghost"}
                            size="icon"
                            class="rounded-lg"
                            aria-label="Clipboard"
                            onclick={() => goto("/clipboard")}
                        >
                            <ClipboardList class="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}
                        >Clipboard</TooltipContent
                    >
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant={page.url.pathname === "/passwords"
                                ? "secondary"
                                : "ghost"}
                            size="icon"
                            class="rounded-lg"
                            aria-label="Passwords"
                            onclick={() => goto("/passwords")}
                        >
                            <Lock class="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}
                        >Passwords</TooltipContent
                    >
                </Tooltip>
            </nav>

            <nav class="mt-auto grid gap-1 p-2">
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant={page.url.pathname === "/settings"
                                ? "secondary"
                                : "ghost"}
                            size="icon"
                            class="rounded-lg"
                            aria-label="Settings"
                            onclick={() => goto("/settings")}
                        >
                            <Settings class="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}
                        >Settings</TooltipContent
                    >
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <Theme />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                        Change Theme
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger>
                        <Login />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}
                        >Auth</TooltipContent
                    >
                </Tooltip>
            </nav>
        </aside>
        <main class="flex-1 flex-col p-4 pl-[5.5rem] md:p-6 md:pl-[6.5rem]">
            {@render children()}
        </main>
        <Toaster />
    </div>
</TooltipProvider>
