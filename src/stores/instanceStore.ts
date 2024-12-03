import { get, writable } from 'svelte/store';

export const selectedInstanceId = writable<string | null>(
	typeof window !== 'undefined' ? localStorage.getItem('selectedInstanceId') : null
);

export function setInstanceId(id: string) {
	localStorage.setItem('selectedInstanceId', id);
	selectedInstanceId.set(id);
}

export function getInstanceId(): string | null {
	return get(selectedInstanceId);
}
