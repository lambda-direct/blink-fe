<script lang="ts">
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import Editor from './Editor';
	import Validator from './Validator';
	import ErrorModal from '../ErrorModal.svelte';
	import type { FormatError, Formats } from './types';
	import { getValue } from './helper';

	export let format: Formats = 'env';
	export let variables: { name: string; value: string }[] = [];

	let value: string = '';
	let label: string = '';
	let codemirror: Editor;
	let element: HTMLDivElement;
	let validator: Validator;

	let errors: FormatError[] = [];
	let showError = false;
	let errorMessage = '';

	const dispatch = createEventDispatcher();

	const updateValue = (newValue: string) => {
		if (newValue.trim() === '') {
			errors = [];
			showError = false;
			errorMessage = '';
			variables = [];
			value = newValue;
			dispatch('update', variables);
			dispatch('errors', []);
			return;
		}
		const validationResult = validator.validate(newValue);

		if (validationResult === true) {
			errors = [];
			showError = false;
			errorMessage = '';
			variables = format === 'env' ? validator.parseEnv(newValue) : validator.parseJson(newValue);
			value = newValue;
			dispatch('update', variables);
			dispatch('errors', []);
		} else {
			errors = validationResult;
			showError = true;
			errorMessage = `Line ${errors[0].line}: ${errors[0].message}`;
			dispatch('errors', errors);
		}
	};

	const handleTabChange = (newFormat: 'env' | 'json') => {
		if (format === newFormat) return;
		format = newFormat;
		errorMessage = '';
		showError = false;
		dispatch('errors', []);
		dispatch('formatChange', format);
		validator = new Validator(format);
		value = getValue(format, variables);
		codemirror.updateConfig({ format, value });
	};

	onMount(() => {
		value = getValue(format, variables);
		validator = new Validator(format);
		codemirror = new Editor({
			element,
			outerValueChange: (newValue: string) => {
				updateValue(newValue);
			},
			placeholder: 'HELLO=world',
			label,
			format,
			readOnly: false,
			initialValue: value
		});
	});

	onDestroy(() => {
		codemirror?.destroy();
	});
</script>

<div class="relative rounded-lg border">
	<div class="flex border-b">
		<button
			class="w-1/2 border-b-2 border-transparent p-2 text-center text-sm text-neutral-400 hover:text-white"
			class:text-white={format === 'env'}
			class:font-medium={format === 'env'}
			class:border-white={format === 'env'}
			on:click={() => handleTabChange('env')}
		>
			ENV
		</button>
		<button
			class="w-1/2 border-b-2 border-transparent p-2 text-center text-sm text-neutral-400 hover:text-white"
			class:text-white={format === 'json'}
			class:border-white={format === 'json'}
			on:click={() => handleTabChange('json')}
		>
			JSON
		</button>
	</div>
	<div bind:this={element}></div>
	<ErrorModal {errorMessage} {showError} />
</div>
