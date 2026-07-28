import React from 'react';
import styled from 'styled-components';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import DetailPanel from './components/DetailPanel';

const AppWrapper = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: var(--color-surface);
`;

const MainContent = styled.div`
	display: flex;
	flex: 1;
	overflow: hidden;
	position: relative;
`;

function App() {
	const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>(null);
	const [detailVisible, setDetailVisible] = React.useState(true);

	const handleCloseDetail = () => {
		setDetailVisible(false);
		setSelectedTaskId(null);
	};

	return (
		<AppWrapper>
			<TitleBar />
			<MainContent>
				<Sidebar />
				<TaskList />
				<DetailPanel visible={detailVisible} onClose={handleCloseDetail} taskId={selectedTaskId} />
			</MainContent>
		</AppWrapper>
	);
}

export default App;
