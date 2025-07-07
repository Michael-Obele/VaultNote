import Dexie, { type EntityTable } from "dexie";

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: number;
  theme: "light" | "dark" | "system";
}

// Define an interface to extend Dexie for type safety in a functional approach
interface VaultNoteDexie extends Dexie {
  // Use 'EntityTable' as specified in the original class property
  notes: EntityTable<Note, "id">;
  settings: EntityTable<Settings, "id">;
}

export const db = new Dexie("vaultnote") as VaultNoteDexie;

db.version(1).stores({
  notes: "++id, title, updatedAt", // Primary key and indexed properties
  settings: "++id", // Primary key for settings
});
