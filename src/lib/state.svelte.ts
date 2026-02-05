import { PersistedState } from "runed";

export let isAuthenticated = new PersistedState("isAuthenticated", false);
export let sessionCookie = new PersistedState("sessionCookie", "");

export let selectedTheme = new PersistedState<"light" | "dark" | "system">(
  "Theme",
  "system",
);

export const globalUiState = $state({
  isCreateNoteDialogOpen: false
});
