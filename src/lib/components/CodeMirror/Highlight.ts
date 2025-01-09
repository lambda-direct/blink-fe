import { EditorView, Decoration, type DecorationSet } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';

class Highlight {
	view: EditorView;
	constructor(view: EditorView) {
		this.view = view;
	}

	public highlightErrorJSON = (lineNumber: number) => {
		removeHighlightedLines(this.view);
		const line = this.view.state.doc.line(lineNumber);
		if (line.text === '') {
			this.view.dispatch({
				effects: [
					addHighlight.of({
						from: 1,
						to: line.to
					})
				]
			});
		} else {
			this.view.dispatch({
				effects: [
					addHighlight.of({
						from: line.from,
						to: line.to
					}),
					EditorView.scrollIntoView(line.from, { y: 'nearest', x: 'start' })
				]
			});
		}
	};

	public highlightErrorLine = (lineNumber: number) => {
		removeHighlightedLines(this.view);
		const line = this.view.state.doc.line(lineNumber);

		this.view.dispatch({
			effects: [
				addHighlight.of({
					from: line.from,
					to: line.to
				}),
				EditorView.scrollIntoView(line.from, { y: 'nearest', x: 'start' })
			]
		});
	};

	public highlightErrorEnv = (lineNumber: number) => {
		removeHighlightedLines(this.view);
		const line = this.view.state.doc.line(lineNumber);
		if (line.text !== '') {
			this.view.dispatch({
				effects: [
					addHighlight.of({
						from: line.from,
						to: line.to
					}),
					EditorView.scrollIntoView(line.from, { y: 'nearest', x: 'start' })
				]
			});
		}
	};
	public clearHighlights = () => {
		removeHighlightedLines(this.view);
	};
}

export default Highlight;

const lineHighlight = Decoration.mark({ class: "error" });
const removeHighlights = StateEffect.define();
const addHighlight = StateEffect.define<{ from: number; to: number }>({
    map: ({ from, to }, change) => ({
        from: change.mapPos(from),
        to: change.mapPos(to)
    })
});


export const lineHighlightField = StateField.define<DecorationSet>({
	create() {
		return Decoration.none;
	},
	update(highlights, tr) {
		for (const e of tr.effects) {
			if (e.is(removeHighlights)) {
				highlights = Decoration.none;
			} else if (e.is(addHighlight)) {
				highlights = highlights.update({
					add: [lineHighlight.range(e.value.from, e.value.to)]
				});
			}
		}
		return highlights;
	},
	provide: (f) => EditorView.decorations.from(f)
});

export const removeHighlightedLines = (view: EditorView) => {
	view.dispatch({
		effects: [removeHighlights.of(null)]
	});
};
