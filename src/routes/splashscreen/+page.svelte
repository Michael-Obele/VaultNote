<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { elasticOut } from "svelte/easing";
    import { Shield, FileText, Clipboard, Key, Sparkles } from "@lucide/svelte";
    import { Card } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { goto } from "$app/navigation";

    let mounted = $state(false);
    let showFeatures = $state(false);
    let showCTA = $state(false);

    // Using $effect instead of onMount for Svelte 5
    $effect(() => {
        mounted = true;

        // Stagger animations
        const featureTimer = setTimeout(() => {
            showFeatures = true;
        }, 800);

        const ctaTimer = setTimeout(() => {
            showCTA = true;
        }, 1500);

        // Cleanup function
        return () => {
            clearTimeout(featureTimer);
            clearTimeout(ctaTimer);
        };
    });

    const features = [
        {
            icon: FileText,
            title: "Markdown Editor",
            description: "Write and preview notes with live markdown rendering",
        },
        {
            icon: Clipboard,
            title: "Clipboard Manager",
            description: "Never lose copied content with intelligent history",
        },
        {
            icon: Shield,
            title: "Password Vault",
            description: "Secure password generation and encrypted storage",
        },
    ];

    function handleGetStarted() {
        goto("/");
    }
</script>

<svelte:head>
    <title>VaultNote - Your Digital Productivity Hub</title>
</svelte:head>

<div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 relative overflow-hidden"
>
    <!-- Decorative background elements -->
    <div
        class="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse"
    ></div>
    <div
        class="absolute bottom-20 right-20 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-pulse"
    ></div>
    <div
        class="absolute top-1/3 right-1/4 w-24 h-24 bg-green-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-10 animate-pulse"
        style="animation-delay: 1s;"
    ></div>

    <div class="max-w-4xl mx-auto text-center relative z-10">
        <!-- Logo and Title -->
        {#if mounted}
            <div
                class="mb-8"
                in:fly={{ y: -50, duration: 1000, easing: elasticOut }}
            >
                <div class="relative mb-6">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"
                    ></div>
                    <div
                        class="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center shadow-2xl"
                    >
                        <Key class="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                </div>

                <h1
                    class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                >
                    VaultNote
                </h1>
                <p
                    class="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
                >
                    Your all-in-one digital productivity hub. Secure notes,
                    smart clipboard management, and encrypted password storage.
                </p>
            </div>
        {/if}

        <!-- Features Grid -->
        {#if showFeatures}
            <div
                class="grid md:grid-cols-3 gap-6 mb-12"
                in:fade={{ duration: 800 }}
            >
                {#each features as feature, index}
                    <Card
                        class="p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90"
                    >
                        <div class="flex flex-col items-center text-center">
                            <div
                                class="mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <feature.icon class="w-6 h-6" />
                            </div>
                            <h3
                                class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
                            >
                                {feature.title}
                            </h3>
                            <p
                                class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
                            >
                                {feature.description}
                            </p>
                        </div>
                    </Card>
                {/each}
            </div>
        {/if}

        <!-- Security Badge -->
        {#if showFeatures}
            <div
                class="flex items-center justify-center mb-8"
                in:fade={{ duration: 600, delay: 600 }}
            >
                <div
                    class="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800 shadow-sm"
                >
                    <Shield class="w-4 h-4" />
                    <span class="text-sm font-medium">End-to-end encrypted</span
                    >
                    <Sparkles class="w-4 h-4" />
                </div>
            </div>
        {/if}

        <!-- Call to Action -->
        {#if showCTA}
            <div
                class="space-y-4"
                in:fly={{ y: 30, duration: 600, easing: elasticOut }}
            >
                <Button
                    size="lg"
                    class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    onclick={handleGetStarted}
                >
                    Get Started
                </Button>

                <p class="text-sm text-slate-500 dark:text-slate-400">
                    Built with Rust & Tauri for maximum security and performance
                </p>
            </div>
        {/if}
    </div>
</div>

<style>
    @keyframes float {
        0%,
        100% {
            transform: translateY(0px) rotate(0deg);
        }
        50% {
            transform: translateY(-10px) rotate(2deg);
        }
    }

    :global(.animate-float) {
        animation: float 6s ease-in-out infinite;
    }

    /* Custom gradient animations */
    @keyframes gradient-shift {
        0%,
        100% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    :global(.animate-gradient) {
        background-size: 200% 200%;
        animation: gradient-shift 3s ease infinite;
    }
</style>
