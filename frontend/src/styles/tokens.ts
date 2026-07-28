export const penumbra = {
	color: {
		surface: '#101013',
		surfaceInset: '#17171c',
		border: '#23232a',
		borderStrong: '#2e2e36',
		onSurface: '#f4f4f5',
		onSurfaceMuted: '#9ba0ab',
		primary: '#e8e5dc',
		primaryHover: '#ffffff',
		onPrimary: '#08080a',
	},
	radius: {
		sm: '6px',
		md: '10px',
		lg: '14px',
		full: '999px',
	},
	font: {
		ui: '"Inter", "Helvetica Neue", Arial, sans-serif',
		display: '"Instrument Serif", Georgia, serif',
	},
	shadow: {
		insetTop: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
		card: '0 8px 30px rgba(0, 0, 0, 0.45)',
	},
	transition: {
		default: '180ms ease',
	},
} as const;

export type PenumbraTheme = typeof penumbra;
