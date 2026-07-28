import React from 'react';
import styled from 'styled-components';

const DetailPanelWrapper = styled.aside<{ $visible?: boolean }>`
	display: flex;
	flex-direction: column;
	width: 320px;
	padding: 20px;
	background-color: var(--color-surface);
	border-left: 1px solid var(--color-border);
	overflow-y: auto;
	transform: translateX(${(props) => (props.$visible ? '0' : '100%')});
	transition: transform var(--transition-default);

	@media (max-width: 900px) {
		position: absolute;
		right: 0;
		top: 40px;
		bottom: 0;
		z-index: 10;
		box-shadow: var(--shadow-card);
	}
`;

const Header = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
`;

const Title = styled.h2`
	font-family: var(--font-display);
	font-size: 18px;
	font-weight: 400;
	color: var(--color-on-surface);
`;

const CloseButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: var(--radius-full);
	color: var(--color-on-surface-muted);
	transition:
		color var(--transition-default),
		background-color var(--transition-default);

	&:hover {
		color: var(--color-on-surface);
		background-color: var(--color-surface-inset);
	}

	svg {
		width: 14px;
		height: 14px;
		stroke-width: 1.5;
	}
`;

const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 1;
	text-align: center;
	gap: 12px;
`;

const EmptyIcon = styled.div`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	height: 48px;
	background-color: var(--color-surface-inset);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-full);
	color: var(--color-on-surface-muted);

	svg {
		width: 20px;
		height: 20px;
		stroke-width: 1.5;
	}
`;

const EmptyTitle = styled.p`
	font-family: var(--font-display);
	font-style: italic;
	font-size: 18px;
	color: var(--color-on-surface);
`;

const EmptyHint = styled.p`
	font-size: 13px;
	color: var(--color-on-surface-muted);
	line-height: 1.5;
	max-width: 200px;
`;

const FormGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: 6px;
	margin-bottom: 16px;
`;

const Label = styled.label`
	font-size: 12px;
	font-weight: 500;
	color: var(--color-on-surface-muted);
	letter-spacing: 0.02em;
`;

const Input = styled.input`
	height: 36px;
	padding: 0 12px;
	background-color: var(--color-surface-inset);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-sm);
	color: var(--color-on-surface);
	font-size: 13px;
	transition:
		border-color var(--transition-default),
		box-shadow var(--transition-default);

	&:focus {
		outline: none;
		border-color: var(--color-border-strong);
		box-shadow: 0 0 0 3px rgba(232, 229, 220, 0.08);
	}

	&::placeholder {
		color: var(--color-on-surface-muted);
		opacity: 0.6;
	}
`;

const TextArea = styled.textarea`
	min-height: 100px;
	padding: 10px 12px;
	background-color: var(--color-surface-inset);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-sm);
	color: var(--color-on-surface);
	font-size: 13px;
	line-height: 1.5;
	resize: vertical;
	transition:
		border-color var(--transition-default),
		box-shadow var(--transition-default);

	&:focus {
		outline: none;
		border-color: var(--color-border-strong);
		box-shadow: 0 0 0 3px rgba(232, 229, 220, 0.08);
	}

	&::placeholder {
		color: var(--color-on-surface-muted);
		opacity: 0.6;
	}
`;

const ActionRow = styled.div`
	display: flex;
	gap: 8px;
	margin-top: 24px;
	padding-top: 16px;
	border-top: 1px solid var(--color-border);
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
	flex: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	height: 32px;
	padding: 0 14px;
	border-radius: var(--radius-full);
	font-size: 12px;
	font-weight: 500;
	letter-spacing: 0.02em;
	transition:
		background-color var(--transition-default),
		border-color var(--transition-default),
		box-shadow var(--transition-default);

	${(props) =>
		props.$variant === 'primary'
			? `
    background-color: var(--color-primary);
    color: var(--color-on-primary);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: var(--shadow-inset-top);

    &:hover {
      background-color: var(--color-primary-hover);
      box-shadow:
        var(--shadow-inset-top),
        0 0 0 6px rgba(232, 229, 220, 0.08);
    }
  `
			: props.$variant === 'danger'
				? `
    background-color: transparent;
    color: #e81123;
    border: 1px solid var(--color-border);

    &:hover {
      background-color: rgba(232, 17, 35, 0.1);
      border-color: #e81123;
    }
  `
				: `
    background-color: transparent;
    color: var(--color-on-surface);
    border: 1px solid var(--color-border);

    &:hover {
      background-color: var(--color-surface-inset);
      border-color: var(--color-border-strong);
    }
  `}
`;

interface DetailPanelProps {
	visible?: boolean;
	onClose?: () => void;
	taskId?: string | null;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ visible = true, onClose, taskId }) => {
	if (!taskId) {
		return (
			<DetailPanelWrapper $visible={visible}>
				<Header>
					<Title>Details</Title>
					{onClose && (
						<CloseButton onClick={onClose} aria-label="Close panel">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
								<path d="M18 6L6 18M6 6l12 12" />
							</svg>
						</CloseButton>
					)}
				</Header>
				<EmptyState>
					<EmptyIcon>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
							<path d="M9 11l3 3L22 4" />
							<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
						</svg>
					</EmptyIcon>
					<EmptyTitle>No task selected</EmptyTitle>
					<EmptyHint>Select a task from the list to view and edit its details</EmptyHint>
				</EmptyState>
			</DetailPanelWrapper>
		);
	}

	return (
		<DetailPanelWrapper $visible={visible}>
			<Header>
				<Title>Edit Task</Title>
				{onClose && (
					<CloseButton onClick={onClose} aria-label="Close panel">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
							<path d="M18 6L6 18M6 6l12 12" />
						</svg>
					</CloseButton>
				)}
			</Header>

			<FormGroup>
				<Label>Title</Label>
				<Input placeholder="Task title" defaultValue="Design system tokens" />
			</FormGroup>

			<FormGroup>
				<Label>Notes</Label>
				<TextArea placeholder="Add notes..." defaultValue="" />
			</FormGroup>

			<FormGroup>
				<Label>Due Date</Label>
				<Input type="date" />
			</FormGroup>

			<FormGroup>
				<Label>Tag</Label>
				<Input placeholder="Add tag" defaultValue="Work" />
			</FormGroup>

			<ActionRow>
				<ActionButton $variant="primary">Save</ActionButton>
				<ActionButton>Cancel</ActionButton>
			</ActionRow>
		</DetailPanelWrapper>
	);
};

export default DetailPanel;
