import crypto from 'crypto';
import fs from 'fs';

type ArticleId = number;
type UserId = string;

type Article = {
	id: ArticleId;
	title: string;
	publisher: string;
	url: string;
	author: string;
	content: string;
	questions: {
		id: number;
		question: string;
		options: {
			id: number;
			option: string;
		}[];
		correctOption: number;
	}[];
};

type Reading = {
	user: UserId;
	article: ArticleId;
	font: string;
	fontRating: number;
	time: number;
	accuracy: number;
	answers: {
		id: number;
		answer: number;
		correctAnswer: number;
	}[];
};

interface Data {
	users: {
		[id: UserId]: {
			readArticles: ArticleId[];
		};
	};
	readings: Reading[];
	articles: Article[];
	fonts: string[];
	counts: {
		articles: {
			[id: ArticleId]: {
				count: number;
				fonts: {
					[font: string]: number;
				};
			};
		};
		users: {
			[id: UserId]: {
				fonts: {
					[font: string]: number;
				};
			};
		};
	};
}

const articles: Article[] = JSON.parse(fs.readFileSync('data/article-data.json').toString());

const fonts = ['roboto', 'times', 'open-sans', 'open-dyslexic', 'cursive'];

let data: Data;
try {
	data = JSON.parse(fs.readFileSync('data/data.json').toString());
} catch (e) {
	data = {
		users: {},
		readings: [],
		articles: [],
		fonts: [],
		counts: {
			articles: {},
			users: {}
		}
	};
}

data.articles = articles;

data.fonts = fonts;

data.counts = {
	articles: Object.fromEntries(
		data.articles.map((a) => {
			const articleReadings = data.readings.filter((r) => r.article === a.id);
			return [
				a.id,
				{
					count: articleReadings.length,
					fonts: Object.fromEntries(
						data.fonts.map((f) => [f, articleReadings.filter((r) => r.font === f).length])
					)
				}
			];
		})
	),
	users: Object.fromEntries(
		Object.entries(data.users).map(([uid, _]) => {
			const articleReadings = data.readings.filter((r) => r.user === uid);
			return [
				uid,
				{
					fonts: Object.fromEntries(
						data.fonts.map((f) => [f, articleReadings.filter((r) => r.font === f).length])
					)
				}
			];
		})
	)
};

export function getReadings(): Reading[] {
	return data.readings;
}

export function getUserCount(): number {
	return Object.entries(data.users).length;
}

export function getReadingsCount(): number {
	return data.readings.length;
}

export function getArticlesCount(): number {
	return data.articles.length;
}

export function getUserData(id: string) {
	return data.users[id];
}

export function getArticle(id: ArticleId) {
	return data.articles[id];
}

export function userExists(id: string) {
	return typeof data.users[id] !== 'undefined';
}

export function addUserReading(id: string, reading: ArticleId) {
	data.users[id].readArticles.push(reading);
}

export function addReading(reading: Reading) {
	data.readings.push(reading);

	data.counts.articles[reading.article].count += 1;
	data.counts.articles[reading.article].fonts[reading.font] += 1;
	data.counts.users[reading.user].fonts[reading.font] += 1;

	fs.writeFileSync('data/data.json', JSON.stringify(data));
}

function chooseUserFont(id: string, fonts: string[]): string {
	let lowest = null;
	let lowestFont = null;
	Object.entries(data.counts.users[id].fonts).forEach(([f, c]) => {
		if ((lowest === null || c < lowest) && fonts.includes(f)) {
			lowest = c;
			lowestFont = f;
		}
	});

	return lowestFont;
}

export function getArticles(id: string): [Article, string] {
	let lowestArticle: [ArticleId, number] = [null, null];

	for (const [articleId, count] of Object.entries(data.counts.articles).filter(
		([aId, _]) => !data.users[id].readArticles.includes(parseInt(aId))
	)) {
		if (lowestArticle[0] === null || count.count < lowestArticle[1]) {
			lowestArticle[0] = parseInt(articleId);
			lowestArticle[1] = count.count;
		}
	}

	if (lowestArticle[0] === null) {
		return null;
	}

	let article: Article = data.articles.filter((a) => a.id === lowestArticle[0])[0];

	let lowestFont: [[string], number] = [null, null];
	for (const [font, count] of Object.entries(data.counts.articles[article.id].fonts)) {
		if (lowestFont[0] === null || count < lowestFont[1]) {
			lowestFont[0] = [font];
			lowestFont[1] = count;
		} else if (count === lowestFont[1]) {
			lowestFont[0].push(font);
		}
	}

	let font = chooseUserFont(id, lowestFont[0]);

	return [article, font];
}

export function createNewUser(): string {
	let id = crypto.randomBytes(24).toString('hex');
	while (data.users[id] !== undefined) {
		id = crypto.randomBytes(24).toString('hex');
	}

	data.users[id] = {
		readArticles: []
	};

	data.counts.users[id] = {
		fonts: Object.fromEntries(data.fonts.map((f) => [f, 0]))
	};

	return id;
}
