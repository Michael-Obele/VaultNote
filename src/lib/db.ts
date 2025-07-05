import Dexie, { type EntityTable } from 'dexie';

export interface Note {
	id: number;
	title: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

export class VaultNoteDB extends Dexie {
	notes!: EntityTable<Note, 'id'>;

	constructor() {
		super('vaultnote');
		this.version(1).stores({
			notes: '++id, title, updatedAt' // Primary key and indexed properties
		});
	}
}

export const db = new VaultNoteDB();
