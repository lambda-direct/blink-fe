import { writable } from 'svelte/store';

export const selectedInstanceId = writable<string | null>(null);

export function setInstanceId(id: string) {
	selectedInstanceId.set(id);
}

export function getInstanceId() {
	return selectedInstanceId;
}
