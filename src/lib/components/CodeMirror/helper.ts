import type { FormatError, Formats } from './types';
import type { StreamParser } from '@codemirror/language';

export const isJSONError = (error: unknown): error is FormatError => {
	return <FormatError>error !== undefined && (<FormatError>error).line !== undefined;
};

export const isEnvError = (error: unknown): error is string[] => {
	return (
		Array.isArray(error) &&
		error.every((item) => typeof item === 'string' && item.startsWith('Line'))
	);
};

export const parseEnvError = (error: string): FormatError | null => {
	const match = error.match(/Line (\d+): (.+)/);
	if (match) {
		return {
			line: parseInt(match[1], 10),
			message: match[2]
		};
	}
	return null;
};

export const getValue = (
	format: Formats,
	variables: { name: string; value: string }[]
): string => {
	return format === 'env'
		? variables.map((v) => `${v.name}=${v.value}`).join('\n')
		: JSON.stringify(Object.fromEntries(variables.map((v) => [v.name, v.value])), null, 2);
};

export const envMode: StreamParser<{ inAssignment: boolean; inMultiline: boolean }> = {
	token(stream, state) {
		if (stream.eatSpace()) return null;
		if (state.inMultiline) {
			if (stream.match(/^(.*?)(\\)?$/)) {
				state.inMultiline = !!stream.match(/\\$/);
				return 'quote';
			}
			state.inMultiline = false;
			stream.skipToEnd();
			return null;
		}

		if (stream.match(/^#.*/)) {
			return 'comment';
		}

		if (!state.inAssignment && stream.sol() && stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*(?=\s*=)/)) {
			return 'variableName';
		}

		if (!state.inAssignment && stream.match(/^=/)) {
			state.inAssignment = true;
			return 'operator';
		}

		if (state.inAssignment) {
			if (stream.match(/^"(?:[^"\\]|\\.)*"/)) {
				state.inAssignment = false;
				return 'quote';
			}
			if (stream.match(/^[^\s#\\]+/)) {
				state.inMultiline = !!stream.match(/\\$/);
				state.inAssignment = false;
				return 'quote';
			}
		}

		stream.next();
		return null;
	},
	startState() {
		return { inAssignment: false, inMultiline: false };
	}
};
