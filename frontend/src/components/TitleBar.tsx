import React from 'react';
import styled from 'styled-components';

declare global {
	interface Window {
		runtime?: {
			WindowMinimise?: () => void;
			WindowToggleMaximise?: () => void;
			Quit?: () => void;
		};
	}
}

const TitleBarWrapper = styled.div`
	--wails-draggable: drag;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 40px;
	padding: 0 12px;
	background-color: var(--color-surface);
	border-bottom: 1px solid var(--color-border);
	user-select: none;
`;

const Title = styled.span`
	font-family: var(--font-display);
	font-style: italic;
	font-size: 14px;
	color: var(--color-on-surface-muted);
	letter-spacing: 0.02em;
`;

const WindowControls = styled.div`
	--wails-draggable: no-drag;
	display: flex;
	align-items: center;
	gap: 4px;
`;

const ControlButton = styled.button<{ $variant?: 'close' }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: var(--radius-sm);
	color: var(--color-on-surface-muted);
	transition:
		background-color var(--transition-default),
		color var(--transition-default);

	&:hover {
		background-color: ${(props) => (props.$variant === 'close' ? '#e81123' : 'var(--color-surface-inset)')};
		color: ${(props) => (props.$variant === 'close' ? '#ffffff' : 'var(--color-on-surface)')};
	}

	svg {
		width: 12px;
		height: 12px;
	}
`;

const TitleBar: React.FC = () => {
	const handleMinimize = () => {
		window.runtime?.WindowMinimise?.();
	};

	const handleMaximize = () => {
		window.runtime?.WindowToggleMaximise?.();
	};

	const handleClose = () => {
		window.runtime?.Quit?.();
	};

	return (
		<TitleBarWrapper>
			<Title>Fishodo</Title>
			<WindowControls>
				<ControlButton onClick={handleMinimize} aria-label="Minimize">
					<svg viewBox="0 0 12 12" fill="currentColor">
						<rect x="2" y="5.5" width="8" height="1" />
					</svg>
				</ControlButton>
				<ControlButton onClick={handleMaximize} aria-label="Maximize">
					<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
						<rect x="2.5" y="2.5" width="7" height="7" />
					</svg>
				</ControlButton>
				<ControlButton $variant="close" onClick={handleClose} aria-label="Close">
					<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1">
						<path d="M2 2l8 8M10 2l-8 8" />
					</svg>
				</ControlButton>
			</WindowControls>
		</TitleBarWrapper>
	);
};

export default TitleBar;
