import React from 'react';
import styled from 'styled-components';

const TaskListWrapper = styled.main`
	flex: 1;
	display: flex;
	flex-direction: column;
	padding: 20px 24px;
	overflow-y: auto;
`;

const Header = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
`;

const Title = styled.h1`
	font-family: var(--font-display);
	font-size: 28px;
	font-weight: 400;
	color: var(--color-on-surface);
	letter-spacing: -0.01em;
`;

const AddButton = styled.button`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 32px;
	padding: 0 14px;
	background-color: var(--color-primary);
	color: var(--color-on-primary);
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: var(--radius-full);
	font-size: 12px;
	font-weight: 500;
	letter-spacing: 0.02em;
	box-shadow: var(--shadow-inset-top);
	transition:
		background-color var(--transition-default),
		box-shadow var(--transition-default);

	&:hover {
		background-color: var(--color-primary-hover);
		box-shadow:
			var(--shadow-inset-top),
			0 0 0 6px rgba(232, 229, 220, 0.08);
	}

	svg {
		width: 12px;
		height: 12px;
	}
`;

const TaskCards = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const TaskCard = styled.article`
	display: flex;
	align-items: flex-start;
	gap: 14px;
	padding: 16px 18px;
	background-color: var(--color-surface);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-lg);
	box-shadow: var(--shadow-inset-top);
	transition:
		border-color var(--transition-default),
		background-color var(--transition-default);

	&:hover {
		border-color: var(--color-border-strong);
		background-color: var(--color-surface-inset);
	}
`;

const Checkbox = styled.button<{ $checked?: boolean }>`
	flex-shrink: 0;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	height: 18px;
	margin-top: 1px;
	background-color: ${(props) => (props.$checked ? 'var(--color-primary)' : 'var(--color-surface-inset)')};
	border: 1px solid ${(props) => (props.$checked ? 'var(--color-primary)' : 'var(--color-border)')};
	border-radius: var(--radius-full);
	transition:
		background-color var(--transition-default),
		border-color var(--transition-default);

	svg {
		width: 10px;
		height: 10px;
		color: var(--color-on-primary);
		opacity: ${(props) => (props.$checked ? 1 : 0)};
		transition: opacity var(--transition-default);
	}
`;

const TaskContent = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const TaskTitle = styled.h3<{ $completed?: boolean }>`
	font-size: 14px;
	font-weight: 500;
	color: ${(props) => (props.$completed ? 'var(--color-on-surface-muted)' : 'var(--color-on-surface)')};
	text-decoration: ${(props) => (props.$completed ? 'line-through' : 'none')};
	transition: color var(--transition-default);
`;

const TaskMeta = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: var(--color-on-surface-muted);
`;

const TaskTag = styled.span`
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	background-color: var(--color-surface-inset);
	border: 1px solid var(--color-border);
	border-radius: var(--radius-full);
	font-size: 11px;
`;

const EmptyState = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	text-align: center;
`;

const EmptyTitle = styled.p`
	font-family: var(--font-display);
	font-style: italic;
	font-size: 20px;
	color: var(--color-on-surface-muted);
	margin-bottom: 8px;
`;

const EmptyHint = styled.p`
	font-size: 13px;
	color: var(--color-on-surface-muted);
	opacity: 0.7;
`;

const TaskList: React.FC = () => {
	const [tasks, setTasks] = React.useState([
		{ id: '1', title: 'Design system tokens', tag: 'Work', completed: false },
		{ id: '2', title: 'Implement title bar', tag: 'Work', completed: true },
		{ id: '3', title: 'Buy groceries', tag: 'Personal', completed: false },
	]);

	const toggleTask = (id: string) => {
		setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
	};

	return (
		<TaskListWrapper>
			<Header>
				<Title>Today</Title>
				<AddButton>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
						<path d="M12 5v14M5 12h14" />
					</svg>
					New Task
				</AddButton>
			</Header>

			{tasks.length === 0 ? (
				<EmptyState>
					<EmptyTitle>No tasks yet</EmptyTitle>
					<EmptyHint>Press Ctrl+N to create your first task</EmptyHint>
				</EmptyState>
			) : (
				<TaskCards>
					{tasks.map((task) => (
						<TaskCard key={task.id}>
							<Checkbox
								$checked={task.completed}
								onClick={() => toggleTask(task.id)}
								aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
									<path d="M20 6L9 17l-5-5" />
								</svg>
							</Checkbox>
							<TaskContent>
								<TaskTitle $completed={task.completed}>{task.title}</TaskTitle>
								<TaskMeta>
									<TaskTag>{task.tag}</TaskTag>
								</TaskMeta>
							</TaskContent>
						</TaskCard>
					))}
				</TaskCards>
			)}
		</TaskListWrapper>
	);
};

export default TaskList;
