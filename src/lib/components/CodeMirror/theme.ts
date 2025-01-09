import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import type { Formats } from './types';

const invalid = '#eaeaea';
const cyan = '#56b6c2';
const malibu = '#61afef';
const violet = '#c678dd';
const darkBackground = '#21252b';
const tooltipBackground = '#FBFBFA';
const tooltipColor = '#373530';

const theme = [
	EditorView.theme({
		'&': {
			height: '425px',
			color: '#abb2bf',
			background: 'transparent',
			margin: '0 0 0 10px',
			padding: ' 0 10px 0 0'
		},
		// '.cm-content .error': {
		// 	backgroundColor: 'rgba(255, 0, 0, 0.25)',
		// },
		'&.cm-focused': {
			outline: 'none'
		},
		'.cm-content': {
			caretColor: '#abb2bf'
		},
		'.cm-selectionMatch': {
			backgroundColor: '#3e4451',
			color: '#98c379'
		},
		'&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground': {
			backgroundColor: '#3e4451'
		},
		'.cm-cursor, .cm-dropCursor': {
			borderLeftColor: '#abb2bf'
		},

		'.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
			{
				background: '#3e4451'
			},

		'.cm-panels': {
			background: darkBackground,
			color: '#abb2bf'
		},
		'.cm-panels.cm-panels-top': {
			borderBottom: '2px solid black'
		},
		'.cm-panels.cm-panels-bottom': {
			borderTop: '2px solid black'
		},
		'.cm-foldGutter span': {
			display: 'none'
		},
		'.cm-activeLine': {
			background: '#f5f5f014'
		},

		'.cm-gutters': {
			background: 'transparent',
			color: '#7d8799',
			border: 'none'
		},

		'.cm-activeLineGutter': {
			background: '#f5f5f014'
		},

		'.cm-foldPlaceholder': {
			background: 'transparent',
			border: 'none',
			color: '#ddd'
		},

		'.cm-tooltip': {
			border: 'none',
			color: tooltipColor,
			background: tooltipBackground
		},

		'.cm-tooltip .cm-tooltip-arrow:before': {
			borderTopColor: 'transparent',
			borderBottomColor: 'transparent'
		},

		'.cm-tooltip .cm-tooltip-arrow:after': {
			borderTopColor: tooltipBackground,
			borderBottomColor: tooltipBackground
		},

		'.cm-tooltip-autocomplete': {
			'& > ul > li[aria-selected]': {
				background: '#f5f5f014',
				color: '#abb2bf'
			}
		}
		
	})
];

const themeHighlightStyleEnv = HighlightStyle.define([
	{ tag: t.variableName, color: '#E06C75' },
	{ tag: [t.quote], color: '#98C379' },
	{ tag: t.operator, color: 'white' },
	{ tag: t.comment, color: '#7d8799' },
	{ tag: t.invalid, color: invalid }
]);

const themeHighlightStyleJSON = HighlightStyle.define([
	{ tag: t.keyword, color: violet },
	{
		tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
		color: '#E06C75'
	},
	{ tag: [t.function(t.variableName), t.labelName], color: malibu },
	{
		tag: [t.color, t.constant(t.name), t.standard(t.name)],
		color: '#d19a66'
	},
	{ tag: [t.definition(t.name), t.separator], color: '#abb2bf' },
	{
		tag: [
			t.typeName,
			t.className,
			t.number,
			t.changed,
			t.annotation,
			t.modifier,
			t.self,
			t.namespace
		],
		color: '#e5c07b'
	},
	{
		tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
		color: cyan
	},
	{ tag: [t.meta, t.comment], color: '#7d8799' },
	{ tag: t.strong, fontWeight: 'bold' },
	{ tag: t.emphasis, fontStyle: 'italic' },
	{ tag: t.strikethrough, textDecoration: 'line-through' },
	{
		tag: t.link,
		color: '#7d8799',
		textDecoration: 'underline'
	},
	{
		tag: t.heading,
		fontWeight: 'bold',
		color: '#e06c75'
	},
	{
		tag: [t.atom, t.bool, t.special(t.variableName)],
		color: '#d19a66'
	},
	{
		tag: [t.processingInstruction, t.string, t.inserted],
		color: '#98c379'
	},
	{ tag: t.invalid, color: invalid }
]);

const themeExtensionsJson: Extension = [theme, syntaxHighlighting(themeHighlightStyleJSON)];
const themeExtensionsEnv: Extension = [theme, syntaxHighlighting(themeHighlightStyleEnv)];

export const getThemeExtention = (format: Formats): Extension => {
	if (format === 'json') return themeExtensionsJson;
	if (format === 'env') return themeExtensionsEnv;
	return themeExtensionsEnv;
};
