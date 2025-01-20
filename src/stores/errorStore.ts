import { writable } from 'svelte/store';

export const errorStore = writable<{ errorMessage: string; showError: boolean }>({
	errorMessage: '',
	showError: false
});

export function setError(errorMessage: string) {
	errorStore.set({ errorMessage, showError: true });
}

export function clearError() {
	errorStore.set({ errorMessage: '', showError: false });
}
