import { css } from 'styled-components';

export const surfaceCard = css`
	background-color: var(--color-surface);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-inset-top);
`;

export const hairlineBorder = css`
	border: 1px solid var(--color-border);
`;

export const focusRing = css`
	&:focus-visible {
		outline: none;
		box-shadow: 0 0 0 6px rgba(232, 229, 220, 0.18);
		border-color: var(--color-primary);
	}
`;

export const insetSurface = css`
	background-color: var(--color-surface-inset);
	border: 1px solid var(--color-border);
`;

export const buttonReset = css`
	background: none;
	border: none;
	padding: 0;
	font: inherit;
	color: inherit;
	cursor: pointer;
`;
