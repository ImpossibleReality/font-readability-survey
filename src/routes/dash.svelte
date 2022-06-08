<script>
	import Paper, { Title, Subtitle, Content } from '@smui/paper';
	import Fab, { Icon } from '@smui/fab';
	import Slider from '@smui/slider';
	import Dialog, { Title as DialogTitle, Content as DialogContent, Actions } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import Radio from '@smui/radio';
	import FormField from '@smui/form-field';

	const fonts = {
		cursive: 'Cedarville Cursive',
		times: 'Times New Roman',
		roboto: 'Roboto',
		'open-dyslexic': 'Open Dyslexic',
		'open-sans': 'Open Sans'
	};

	export let article;
	export let font;

	let articleExists = false;
	let articleName;
	let articleSourceLink;
	let articleSourceName;
	let articleContent;
	let questions;

	if (article !== null) {
		articleExists = true;
		articleName = article.title;
		articleSourceLink = article.url;
		articleSourceName = article.publisher;
		articleContent = article.content;
		questions = article.questions;
	}

	let articleFocus = false;

	let hasFinished = false;

	let startTime = null;

	let currentTime = null;

	let time = '00:00.00';

	let timer_handler = null;

	let isFirstTime = true;

	if (typeof localStorage !== 'undefined') {
		isFirstTime = localStorage.getItem('isFirstTime') !== 'no';
	}

	let answers = [];
	let rating = 5;

	let hasAnswered = false;
	let hasRated = false;

	let currentQuestion = 0;
	let selectedAnswer = null;

	function update_timer() {
		if (startTime !== null) {
			currentTime = Date.now() - startTime;
			time =
				String(Math.floor((currentTime % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0') +
				':' +
				String(Math.floor((currentTime % (1000 * 60)) / 1000)).padStart(2, '0') +
				'.' +
				String(Math.floor((currentTime % 1000) / 10)).padStart(2, '0');
		}
	}

	function submit_reading() {
		let readingData = {};
		readingData.article = article.id;
		readingData.answers = answers;
		readingData.time = currentTime;
		readingData.font = font;
		readingData.fontRating = rating / 10;

		fetch('/reading', {
			method: 'POST',
			body: JSON.stringify(readingData),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
</script>

<Dialog
	open={isFirstTime}
	aria-labelledby="simple-title"
	aria-describedby="simple-content"
	on:SMUIDialog:closed={() => {
		isFirstTime = false;
		localStorage.setItem('isFirstTime', 'no');
	}}
>
	<DialogTitle id="simple-title">Instructions</DialogTitle>
	<DialogContent id="simple-content">
		This is a fun survey to see which kinds of fonts are easier to read and understand on a computer
		screen. You are timed on how fast you can read the article with the specific font, and you are
		then tasked with answering questions about the article to gauge your understanding.
		<br />
		<h3>Getting Started</h3>
		Once you start reading the article, try to&nbsp;<b>skim quickly</b> through it, but
		<b>make sure that you understand it</b>. If you have to go back and reread a sentence or two to
		understand it better, <b>do that</b>. We care more about how much the reader was able to
		understand the articles than how fast they read it. If you have already read the article before,
		or you feel that you already understand the topics presented in the article,
		<b>please skip the article</b>
		so that we can get more accurate results.
		<br />
		<br />
		<hr />
		Before you take the survey,&nbsp;<b>make sure</b> that you change your zoom on the page to the
		<b>default of 100%</b>. Thank you!
	</DialogContent>
	<Actions>
		<Button
			on:click={() => {
				isFirstTime = false;
				localStorage.setItem('isFirstTime', 'no');
			}}
		>
			<Label>Ok</Label>
		</Button>
	</Actions>
</Dialog>

<div class="main-container">
	<div class="paper-container" class:done-container={!articleExists}>
		<Paper>
			{#if !articleExists}
				<Title>No More Articles</Title>
				<Content>
					<img src="/dog-gif.gif" class="image" />
					<br />
					We have run out of articles to show you for the time being. <b>Thank you</b> for participating
					in this survey, and please do come back later!
				</Content>
			{:else}
				<Title>{articleName}</Title>
				<Subtitle>Article from: <a href={articleSourceLink}>{articleSourceName}</a></Subtitle>
				<Content>
					<div
						class="article-content"
						class:article-hidden={!articleFocus && !hasAnswered}
						style:font-family={fonts[font]}
					>
						{articleContent}
					</div>
					<hr />
					<span class="timer">{time}</span>
					<Button
						disabled={hasFinished}
						on:click={() => {
							if (!articleFocus) {
								articleFocus = true;
								startTime = Date.now();
								timer_handler = setInterval(update_timer, 10);
							} else {
								clearInterval(timer_handler);
								articleFocus = false;
								hasFinished = true;
								window.getSelection().removeAllRanges();
							}
						}}
					>
						<Label>{articleFocus ? 'Finish' : 'Start'} Reading</Label>
					</Button>

					{#if hasFinished || articleFocus}
						<Button
							on:click={() => {
								window.location.reload();
							}}
						>
							<Label>Skip Article</Label>
						</Button>
					{/if}
				</Content>
			{/if}
		</Paper>
	</div>

	{#if hasFinished}
		<div class="paper-container">
			<div
				class="progress-bar"
				style:width={hasAnswered ? '100%' : (currentQuestion / questions.length) * 100 + '%'}
				class:hidden={hasAnswered}
			/>
			<Paper>
				<Title
					>{hasAnswered
						? hasRated
							? 'Finished Article'
							: 'How easy was the font to read?'
						: questions[currentQuestion].question}</Title
				>
				<Subtitle hidden={hasRated}
					>{hasAnswered
						? 'Please rate the font based on how easy it was to read on a scale from one to ten.'
						: 'Please do not cheat on this question.'}</Subtitle
				>
				<Content>
					{#if hasAnswered}
						{#if hasRated}
							You have finished reading and answering questions on this article. Feel free to read a
							new one, and thank you for your contributions!
							<br />
							<Button
								on:click={() => {
									window.location.reload();
								}}
							>
								<Label>Next Article</Label>
							</Button>
						{:else}
							<Slider bind:value={rating} min={0} max={10} step={1} discrete tickMarks /><br />
							<Button
								on:click={() => {
									hasRated = true;
									submit_reading();
								}}
							>
								<Label>Submit</Label>
							</Button>
						{/if}
					{:else}
						{#each questions[currentQuestion].options as option}
							<FormField>
								<Radio bind:group={selectedAnswer} value={option.id} />
								<span slot="label">
									{option.option}
								</span>
							</FormField>
							<br />
						{/each}
						<Button
							disabled={selectedAnswer === null}
							on:click={() => {
								answers.push({
									id: questions[currentQuestion].id,
									answer: selectedAnswer
								});
								if (currentQuestion === questions.length - 1) {
									hasAnswered = true;
								} else {
									currentQuestion++;
									selectedAnswer = null;
								}
							}}
						>
							<Label>Next Question</Label>
						</Button>
					{/if}
				</Content>
			</Paper>
		</div>
	{/if}
</div>
<span class="spacer" />
<div class="help-button">
	<Fab on:click={() => (isFirstTime = true)} exited={articleFocus} color="primary">
		<Icon class="material-icons">question_mark</Icon>
	</Fab>
</div>

<style lang="scss">
	/* "cursive" */
	@import url('https://fonts.googleapis.com/css2?family=Cedarville+Cursive&display=swap');
	/* "roboto" */
	@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
	/* "open-sans" */
	@import url('https://fonts.googleapis.com/css2?family=Open+Sans&display=swap');

	/* "dyslexic" */
	@font-face {
		font-family: 'Open Dyslexic';
		src: url('/opendyslexic.otf') format('opentype');
	}

	b {
		color: #9853ff;
		font-weight: bolder;
	}

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
	.done-container {
		width: 400px;
	}
	.article-content {
		transition: filter 0.1s;
		font-size: 10pt;
		line-height: normal;
	}
	.article-hidden {
		filter: blur(10px);
		user-select: none;
	}
	.progress-bar {
		height: 5px;
		border-radius: 4px;
		transition: width 0.5s cubic-bezier(0.075, 0.82, 0.165, 1), opacity 0.7s ease-in-out;
		transform: translateY(100%);
		background-color: #edab5a;
	}
	.hidden {
		opacity: 0;
	}
	.image {
		width: 100%;
	}
	.help-button {
		position: fixed;
		bottom: 10px;
		left: 10px;
	}
	.spacer {
		display: none;
		width: 1px;
		height: 66px;
	}
	@media only screen and (max-width: 932px) {
		.spacer {
			display: block;
		}
	}
</style>
