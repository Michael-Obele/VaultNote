<script lang="ts">
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { isAuthenticated, sessionCookie } from "$lib/state.svelte";
  import { LogOut } from "@lucide/svelte";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Card, CardContent } from "$lib/components/ui/card/index.js";

  let username = $state("");
  let password = $state("");
  let message = $state("");
  let isSuccess = $state(false);

  async function handleLogin(event: SubmitEvent) {
    event.preventDefault();
    message = "";
    isSuccess = false;

    // This will be the endpoint for the login
    const loginUrl = `${process.env.VITE_LOGIN_URL}auth/login`;

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        isSuccess = true;
        message = data.message;
        if (data.sessionToken) {
          // In a real app, you'd save this token to manage the user's session
          isAuthenticated.current = true;
          sessionCookie.current = data.sessionToken;
          console.log("Session Token:", data.sessionToken);
        }
      } else {
        isSuccess = false;
        message = data.message || "An unexpected error occurred.";
      }
    } catch (error) {
      isSuccess = false;
      message = `Network error: ${(error as Error).message}`;
      console.error("Login fetch error:", error);
    }
  }

  function handleLoginSuccess() {
    isAuthenticated.current = true;
  }

  function handleLogout() {
    isAuthenticated.current = false;
    // Optionally, clear session token from storage here
  }
</script>

<Dialog.Root>
  <Dialog.Trigger
    class="{buttonVariants({
      variant: 'ghost',
      size: 'icon',
    }) + ' rounded-lg'}}"
  >
    <LogOut class="h-5 w-5" />
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <!-- <Dialog.Title>Login Here!</Dialog.Title> -->
      <Dialog.Description>
        {#if isAuthenticated.current}
          <Card class="w-full max-w-sm mx-auto">
            <CardContent
              class="flex flex-col items-center justify-center p-6 text-center"
            >
              <p class="text-lg font-semibold mb-4">
                You're logged in! Logout here to end your session.
              </p>
              <Button
                variant="destructive"
                size="lg"
                class="rounded-lg"
                aria-label="Logout"
                onclick={handleLogout}
              >
                <LogOut class="h-5 w-5 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        {:else}
          <div class="w-full max-w-sm mx-auto">
            <form onsubmit={(event) => handleLogin(event)}>
              <div class="grid gap-4">
                <div class="grid gap-2">
                  <h1 class="text-3xl font-bold">Login</h1>
                  <p class="text-balance text-muted-foreground">
                    Enter your username below to login to your account
                  </p>
                </div>
                <div class="grid gap-2">
                  <Label for="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    bind:value={username}
                    required
                  />
                </div>
                <div class="grid gap-2">
                  <div class="flex items-center">
                    <Label for="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    bind:value={password}
                    required
                  />
                </div>
                <Button type="submit" class="w-full">Login</Button>
              </div>
            </form>
            {#if message}
              <p
                class="{isSuccess
                  ? 'text-green-500'
                  : 'text-red-500'} mt-4 text-center"
              >
                {message}
              </p>
            {/if}
          </div>
        {/if}
      </Dialog.Description>
    </Dialog.Header>
  </Dialog.Content>
</Dialog.Root>
