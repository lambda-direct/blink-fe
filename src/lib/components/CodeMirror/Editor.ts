import { basicSetup } from 'codemirror';
import { EditorState, SelectionRange, type Extension } from '@codemirror/state';
import { EditorView, placeholder as placeholderSet } from '@codemirror/view';
import { StreamLanguage, type LanguageSupport } from '@codemirror/language';
import { json } from '@codemirror/lang-json';
import { getThemeExtention } from './theme';
import type { CursorPosition, Formats } from './types';
import Validator from './Validator';
import Highlight, { lineHighlightField } from './Highlight';
import { envMode } from './helper';

class Codemirror {
	view: EditorView;
	element: HTMLDivElement;
	outerValueChange: (newValue: string, cursorPos: CursorPosition) => void;
	placeholder: string;
	format: Formats;
	highlighter: Highlight;
	validator: Validator;
	readOnly: boolean;
	// errors: string[] = [];
	constructor({
		element,
		outerValueChange,
		placeholder,
		format,
		readOnly,
		initialValue
	}: {
		element: HTMLDivElement;
		outerValueChange: (newValue: string, cursorPos: CursorPosition) => void;
		placeholder: string;
		label: string;
		format: Formats;
		readOnly: boolean;
		initialValue: string;
	}) {
		this.element = element;
		this.outerValueChange = outerValueChange;
		this.placeholder = placeholder;
		this.format = format;
		this.readOnly = readOnly;
		this.validator = new Validator(format);
		this.view = this.init(element, initialValue);
		this.highlighter = new Highlight(this.view);
	}

	private createEditorState = (value: string, extensions: Extension[]): EditorState => {
		return EditorState.create({
			doc: value,
			extensions
		});
	};

	public init = (element: HTMLDivElement, initialValue: string): EditorView => {
		const extensions = this.getExtentions();
		return new EditorView({
			parent: element,
			state: this.createEditorState(initialValue, extensions),
			dispatch: (transaction) => {
				this.view.update([transaction]);
				if (transaction.docChanged) {
					const docValue = this.view.state.doc.toString();
					this.validateInput(docValue);
					this.outerValueChange(docValue, this.trackCursorPosition());
				}
			}
		});
	};

	private getFileFormat = (format: Formats): LanguageSupport | StreamLanguage<unknown> => {
		if (format === 'json') return json();
		if (format === 'env') return StreamLanguage.define(envMode);
		return StreamLanguage.define(envMode);
	};

	private getExtentions = (): Extension[] => {
		const fieldFormat = this.getFileFormat(this.format);
		const themeExtension = getThemeExtention(this.format);
		return [
			EditorView.lineWrapping,
			EditorState.readOnly.of(this.readOnly),
			basicSetup,
			lineHighlightField,
			themeExtension,
			placeholderSet(this.placeholder),
			fieldFormat,
		];
	};

	public updateConfig = ({ format, value }: { format?: Formats; value?: string; }) => {
		if (format && format !== this.format) {
			this.format = format;
			this.placeholder = this.validator.getPlaceholder(format);
			const extensions = this.getExtentions();
			const newState = this.createEditorState(value ?? this.view.state.doc.toString(), extensions);
			this.view.setState(newState);
		}
	
		if (value && value !== this.view.state.doc.toString()) {
			this.updateCodemirrorValue(value);
		}
	};

	public updateCodemirrorValue = (input: string) => {
		const { state } = this.view;
		const selection = state.selection.main;

		const transition = state.update({
			changes: { from: 0, to: state.doc.length, insert: input }
		});

		this.view.dispatch(transition);
		if (input.length > 0 && state.doc.length >= selection.anchor) {
			this.view.dispatch({
				selection: { anchor: selection.anchor, head: selection.anchor },
				scrollIntoView: true
			});
		}
	};
	

	public trackCursorPosition = (): { line: number; col: number } => {
		const { doc, selection } = this.view.state;
		const mainRange: SelectionRange = selection.main;
		const lineInfo = doc.lineAt(mainRange.head);
		const line = lineInfo.number;
		const col = mainRange.head - lineInfo.from;

		return { line, col };
	};

	private validateInput = (docValue: string) => {
		const validationResult = this.validator.validate(docValue);
		this.highlighter.clearHighlights();
		// this.errors = [];
		// if (validationResult === true) {
		// 	this.errors = [];
		// 	return;
		// }

		if (Array.isArray(validationResult)) {
			validationResult.forEach((error) => {
				this.highlighter.highlightErrorEnv(error.line);
				// this.errors.push(`Line ${error.line}: ${error.message}`);
			});
		}
	};

	public scrollToTop = () => {
		this.view.dispatch({
			effects: [EditorView.scrollIntoView(1, { y: 'nearest' })]
		});
	};

	public destroy = () => {
		this.view?.destroy();
	};
}

export default Codemirror;
