import * as prettier from 'prettier/standalone';
import { prettierJSONSettings } from './settings';
import type { FormatError, Formats } from './types';

class Validator {
	format: Formats;
	constructor(format: Formats) {
		this.format = format;
	}

	public getPlaceholder(format: Formats): string {
		return format === 'env' ? 'HELLO=world' : '';
	}

	private validateJSON = (input: string): true | FormatError[] => {
		if (input.trim() === '') {
			return true;
		}
		try {
			JSON.parse(input);

			const errors: FormatError[] = [];
			const keys = new Map<string, number>();
			const lines = input.split('\n');

			lines.forEach((line, index) => {
				const trimmedLine = line.trim();
				const keyMatch = trimmedLine.match(/^"([^"]+)":\s*"?([^"]*)"?/);
				if (keyMatch) {
					const key = keyMatch[1];
					const value = keyMatch[2];
					if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
						errors.push({
							line: index + 1,
							message: `Invalid variable name`
						});
					}
					if (keys.has(key)) {
						errors.push({
							line: index + 1,
							message: `Duplicate variable name '${key}'`
						});
					}
					if (/\s/.test(value)) {
						errors.push({
							line: index + 1,
							message: `Whitespace is not allowed`
						});
					}
					keys.set(key, index + 1);
				}
			});
			if (errors.length > 0) {
				return errors;
			}
			prettier.format(input, prettierJSONSettings);
			return true;
		} catch (err: unknown) {
			if (err instanceof Error) {
				const line = this.extractLineFromError(err.message) || 1;
				return [{ line, message: 'Invalid JSON' }];
			}
			return [{ line: 1, message: 'An unknown error occurred' }];
		}
	};

	private extractLineFromError = (errorMessage: string): number | undefined => {
		const match = errorMessage.match(/line (\d+)/);
		return match ? parseInt(match[1], 10) : undefined;
	};

	private validateENV = (input: string): true | FormatError[] => {
		const lines = input.split('\n');
		const errors: FormatError[] = [];
		const currentNames = new Set<string>();

		lines.forEach((line, index) => {
			const lineNumber = index + 1;
			const trimmedLine = line.trim();
			if (trimmedLine === '' || trimmedLine.startsWith('#')) return;

			const [name, ...valueParts] = trimmedLine.split('=');
			const value = valueParts.join('=').trim();

			if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
				errors.push({ line: lineNumber, message: 'Invalid variable name' });
			} else if (currentNames.has(name.trim())) {
				errors.push({ line: lineNumber, message: `Duplicate variable name '${name.trim()}'` });
			}

			if (/\s/.test(value)) {
				errors.push({
					line: lineNumber,
					message: `Whitespace is not allowed`
				});
			}
			currentNames.add(name.trim());
		});

		return errors.length === 0 ? true : errors;
	};

	public parseEnv = (input: string): { name: string; value: string }[] => {
		return input
			.split('\n')
			.filter((line) => line.trim() !== '')
			.map((line) => {
				const [name, ...valueParts] = line.split('=');
				return { name: name.trim(), value: valueParts.join('=').trim() };
			});
	};

	public parseJson = (input: string): { name: string; value: string }[] => {
		const parsed = JSON.parse(input);
		return Object.entries(parsed).map(([name, value]) => ({
			name,
			value: String(value)
		}));
	};

	public validate = (userInput: string) => {
		if (this.format === 'json') return this.validateJSON(userInput);
		if (this.format === 'env') return this.validateENV(userInput);
		return [{ line: 1, message: 'Invalid format' }];
	};
}

export default Validator;
