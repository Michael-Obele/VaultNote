# Svelte 5 Best Practices and Migration Guide for VaultNote

This document outlines the best practices for writing Svelte 5 code within the VaultNote project. The transition from Svelte 4 to Svelte 5 introduces "Runes," a more explicit and powerful system for reactivity. Adopting these new patterns from the start will lead to a more maintainable, scalable, and performant application.

## The Core Philosophy: From Magic to Explicitness

Svelte 4 relied on "magic" compiler transformations (e.g., `let` being reactive at the top level). Svelte 5 makes reactivity explicit through **Runes**—special functions prefixed with a `$` that act as compiler keywords. This approach eliminates ambiguity, improves TypeScript support, and allows reactive patterns to be used anywhere, not just at the top level of a component.

**Our Rule:** All new components in VaultNote **must** be written using Svelte 5's Runes syntax.

---

## 1. State Management: Use `$state`

Reactive state is the foundation of your component.

-   **DON'T (Svelte 4):** Rely on implicitly reactive `let` declarations.
    ```javascript
    // Old way: implicitly reactive
    let count = 0;
    ```
-   **DO (Svelte 5):** Use the `$state` rune to explicitly create reactive state. The variable itself is the value, not a wrapper, so you can interact with it directly.
    ```javascript
    // New way: explicitly reactive
    let count = $state(0);

    function increment() {
        count += 1; // Direct assignment works
    }
    ```
-   **For Performance:** When dealing with large arrays or objects that you only intend to replace, not mutate, use `$state.raw` to avoid the overhead of deep reactivity.
    ```javascript
    let largeObject = $state.raw({ ... });
    // This won't trigger updates: largeObject.property = 'new value';
    // This will: largeObject = { ... };
    ```

## 2. Derived State: Use `$derived`

For values that are calculated from other state, `$derived` is the go-to tool. It replaces `$:`.

-   **DON'T (Svelte 4):** Use reactive `$: ` labels for derivations.
    ```javascript
    // Old way:
    let count = 0;
    $: doubled = count * 2;
    ```
-   **DO (Svelte 5):** Use the `$derived` rune. Svelte tracks the dependencies automatically and efficiently re-calculates the value only when needed.
    ```javascript
    // New way:
    let count = $state(0);
    let doubled = $derived(count * 2);
    ```
-   **For Complex Logic:** Use `$derived.by` for multi-line derivations.
    ```javascript
    let total = $derived.by(() => {
        // ... complex calculation ...
        return result;
    });
    ```

## 3. Side Effects: Use `$effect` Sparingly

Side effects are actions that interact with the "outside world" (e.g., DOM manipulation, analytics, timers). `$effect` replaces `$: ` for side effects.

-   **DON'T (Svelte 4):** Use reactive `$: ` labels for side effects.
    ```javascript
    // Old way:
    $: console.log('Count is', count);
    ```
-   **DO (Svelte 5):** Use the `$effect` rune. It runs after the DOM has been updated. If you need a teardown function (like for `setInterval`), return it from the effect.
    ```javascript
    // New way:
    $effect(() => {
        console.log('Count is now', count);

        const timer = setInterval(() => { /* ... */ }, 1000);

        // This runs before the effect re-runs or when the component is destroyed
        return () => {
            clearInterval(timer);
        };
    });
    ```
-   **CRITICAL:** `$effect` is an **escape hatch**, not a tool for state management. **If you find yourself writing state assignments inside an `$effect`, you are likely doing something wrong.** Your first choice should always be `$derived`.

## 4. Component Props: Use `$props`

Declaring component properties is now cleaner and more aligned with standard JavaScript.

-   **DON'T (Svelte 4):** Use `export let`.
    ```javascript
    // Old way:
    export let name;
    export let status = 'default';
    ```
-   **DO (Svelte 5):** Use `$props()` with destructuring. This makes default values, renaming, and handling rest props trivial.
    ```javascript
    // New way:
    let { name, status = 'default', ...rest } = $props();
    ```

## 5. Bindings: Be Explicit with `$bindable`

In Svelte 5, two-way bindings must be explicitly opted into by the child component.

-   **DON'T (Svelte 4):** Assume any prop is bindable.
-   **DO (Svelte 5):** Mark a prop as bindable using the `$bindable` rune. This makes the component's API much clearer.
    ```javascript
    // In Child.svelte
    let { value = $bindable(0) } = $props();

    // In Parent.svelte
    <Child bind:value={parentValue} />
    ```

## 6. Event Handling: Use Standard Attributes and Callback Props

This is a major philosophical shift that reduces Svelte-specific syntax.

### DOM Events

-   **DON'T (Svelte 4):** Use the `on:` directive.
    ```javascript
    <button on:click={handleClick}>Click</button>
    ```
-   **DO (Svelte 5):** Use the standard HTML attribute.
    ```javascript
    <button onclick={handleClick}>Click</button>
    ```

### Component Events

-   **DON'T (Svelte 4):** Use `createEventDispatcher`.
-   **DO (Svelte 5):** Use **callback props**. The parent passes a function to the child as a prop. This is more type-safe and easier to reason about.
    ```javascript
    // In Child.svelte
    let { onSomething } = $props();
    // ...
    <button onclick={() => onSomething({ detail: 'some data' })}>Do Something</button>

    // In Parent.svelte
    function handleTheThing(event) {
        console.log(event.detail);
    }
    // ...
    <Child onSomething={handleTheThing} />
    ```

## 7. Content Projection: Use Snippets

Snippets are a more powerful and explicit replacement for slots.

-   **DON'T (Svelte 4):** Use `<slot>` and `let:`.
-   **DO (Svelte 5):** Use `{@render ...}` to render a snippet, and `{#snippet ...}` to define one. The default slot is passed as a `children` prop.
    ```javascript
    // In List.svelte
    let { items, children, item: itemSnippet } = $props();

    {#each items as item}
        {@render itemSnippet(item)}
    {/each}

    // In Parent.svelte
    <List {items}>
        {#snippet item(thing)}
            <p>This is list item: {thing}</p>
        {/snippet}
    </List>
    ```

---

## Quick Reference: Svelte 4 vs. Svelte 5

| Purpose | Svelte 4 (Legacy Way) | Svelte 5 (Modern Way for VaultNote) |
| :--- | :--- | :--- |
| **Reactive State** | `let count = 0;` | `let count = $state(0);` |
| **Derived State** | `$: doubled = count * 2;` | `let doubled = $derived(count * 2);` |
| **Side Effects** | `$: console.log(count);` | `$effect(() => { console.log(count); });` |
| **Component Props**| `export let name;` | `let { name } = $props();` |
| **Two-way Binding**| `export let value;` (implicit) | `let { value = $bindable() } = $props();` (explicit) |
| **DOM Events** | `<button on:click={...}>` | `<button onclick={...}>` |
| **Component Events**| `createEventDispatcher` | Pass functions as callback props |
| **Content** | `<slot>` and `let:item` | `{#snippet}` and `{@render item()}` |
| **Dynamic Component**| `<svelte:component this={C}>` | `<C />` (just works) |