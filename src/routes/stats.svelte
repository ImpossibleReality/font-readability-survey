<script>
	import { Title, Content, Subtitle } from '@smui/paper';
	import DataTable, { Body, Row, Cell } from '@smui/data-table';
	import Paper from '@smui/paper';
	import Tab, { Icon, Label } from '@smui/tab';
	import TabBar from '@smui/tab-bar';

	export let users;
	export let readings;
	export let articles;
	export let accuracy;

	export let personal;

	let tabs = [
		{
			icon: 'language',
			label: 'Global'
		},
		{
			icon: 'person',
			label: 'User'
		}
	];
	let active = tabs[0];
	$: activeTab = tabs.indexOf(active);
</script>

<div class="main-container">
	<div class="paper-container">
		<Paper>
			<Title>Stats For Nerds</Title>
			<Subtitle>Check out how you and others are doing with this survey.</Subtitle>
		</Paper>
	</div>
	<div class="paper-container">
		<Paper class="paper-square-padding">
			{#if personal === null}
				<Title>Global Statistics</Title>
			{/if}
			<Content>
				{#if personal !== null}
					<TabBar {tabs} let:tab bind:active>
						<Tab {tab}>
							<Icon class="material-icons">{tab.icon}</Icon>
							<Label>{tab.label}</Label>
						</Tab>
					</TabBar>
				{/if}
				{#if activeTab == 0}
					<DataTable style="width: 100%; margin-top: 5px;">
						<Body>
							<Row>
								<Cell>Total Users</Cell>
								<Cell numeric>{users}</Cell>
							</Row>
							<Row>
								<Cell>Total Readings</Cell>
								<Cell numeric>{readings}</Cell>
							</Row>
							<Row>
								<Cell>Number of Articles</Cell>
								<Cell numeric>{articles}</Cell>
							</Row>
							<Row>
								<Cell>Average Accuracy</Cell>
								<Cell numeric>{accuracy * 100 + '%' || 'N/A'}</Cell>
							</Row>
						</Body>
					</DataTable>
				{:else if activeTab == 1}
					<DataTable style="width: 100%; margin-top: 5px;">
						<Body>
							<Row>
								<Cell>Personal Readings</Cell>
								<Cell numeric>{personal.readings}</Cell>
							</Row>
							<Row>
								<Cell>Personal Average Accuracy</Cell>
								<Cell numeric>{personal.accuracy * 100 + '%' || 'N/A'}</Cell>
							</Row>
						</Body>
					</DataTable>
				{/if}</Content
			>
		</Paper>
	</div>
</div>

<style>
	.main-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.paper-container {
		width: 800px;
		max-width: 95vw;
		margin-top: 10px;
	}
	:global(.paper-square-padding) {
		padding: 16px 16px;
	}
</style>
