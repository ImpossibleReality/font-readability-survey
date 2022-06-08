<script>
	import Paper, { Title, Subtitle, Content } from '@smui/paper';
	import Button, { Label } from '@smui/button';
</script>

<div class="main-container">
	<div class="paper-container">
		<Paper>
			<Title>Font Readability Survey</Title>
			<Subtitle>Made by Johan, Aarav, Adam, and Arnav</Subtitle>
			<Content
				><Button href="/dash">
					<Label>Open Form</Label>
				</Button>
				<Button href="/stats">
					<Label>View Statistics</Label>
				</Button></Content
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
</style>
