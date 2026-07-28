import React from 'react';
import styled from 'styled-components';

const SidebarWrapper = styled.aside`
	display: flex;
	flex-direction: column;
	width: 240px;
	padding: 16px 12px;
	background-color: var(--color-surface);
	border-right: 1px solid var(--color-border);
	overflow-y: auto;
`;

const Section = styled.section`
	margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
	margin: 0 0 8px;
	padding: 0 8px;
	color: var(--color-on-surface-muted);
	font-size: 11px;
	font-weight: 500;
	letter-spacing: 0.16em;
	text-transform: uppercase;
`;

const NavList = styled.ul`
	display: flex;
	flex-direction: column;
	gap: 2px;
`;

const NavItem = styled.li<{ $active?: boolean }>`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	border-radius: var(--radius-sm);
	color: ${(props) => (props.$active ? 'var(--color-on-surface)' : 'var(--color-on-surface-muted)')};
	background-color: ${(props) => (props.$active ? 'var(--color-surface-inset)' : 'transparent')};
	font-size: 13px;
	cursor: pointer;
	transition:
		background-color var(--transition-default),
		color var(--transition-default);

	&:hover {
		background-color: var(--color-surface-inset);
		color: var(--color-on-surface);
	}
`;

const NavIcon = styled.span`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 16px;
	height: 16px;

	svg {
		width: 14px;
		height: 14px;
		stroke-width: 1.5;
	}
`;

const Sidebar: React.FC = () => {
	const [activeItem, setActiveItem] = React.useState('today');

	const navItems = [
		{
			id: 'today',
			label: 'Today',
			icon: (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
					<rect x="3" y="4" width="18" height="18" rx="2" />
					<path d="M16 2v4M8 2v4M3 10h18" />
				</svg>
			),
		},
		{
			id: 'upcoming',
			label: 'Upcoming',
			icon: (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 6v6l4 2" />
				</svg>
			),
		},
		{
			id: 'all',
			label: 'All Tasks',
			icon: (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
					<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
				</svg>
			),
		},
		{
			id: 'completed',
			label: 'Completed',
			icon: (
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
					<path d="M22 4L12 14.01l-3-3" />
				</svg>
			),
		},
	];

	const tags = [
		{ id: 'work', label: 'Work' },
		{ id: 'personal', label: 'Personal' },
		{ id: 'urgent', label: 'Urgent' },
	];

	return (
		<SidebarWrapper>
			<Section>
				<SectionTitle>Lists</SectionTitle>
				<NavList>
					{navItems.map((item) => (
						<NavItem key={item.id} $active={activeItem === item.id} onClick={() => setActiveItem(item.id)}>
							<NavIcon>{item.icon}</NavIcon>
							{item.label}
						</NavItem>
					))}
				</NavList>
			</Section>

			<Section>
				<SectionTitle>Tags</SectionTitle>
				<NavList>
					{tags.map((tag) => (
						<NavItem key={tag.id} $active={activeItem === tag.id} onClick={() => setActiveItem(tag.id)}>
							<NavIcon>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
									<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
									<path d="M7 7h.01" />
								</svg>
							</NavIcon>
							{tag.label}
						</NavItem>
					))}
				</NavList>
			</Section>
		</SidebarWrapper>
	);
};

export default Sidebar;
