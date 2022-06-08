import * as data from '$lib/data';
import { parse } from 'cookie';
import Ajv from 'ajv';

const ajv = new Ajv();

const schema = {
	type: 'object',
	properties: {
		article: { type: 'integer' },
		font: { type: 'string' },
		time: { type: 'number' },
		fontRating: { type: 'number' },
		answers: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					id: { type: 'integer' },
					answer: { type: 'integer' }
				},
				required: ['id', 'answer'],
				additionalProperties: false
			}
		}
	},
	required: ['article', 'font', 'time', 'answers', 'fontRating'],
	additionalProperties: false
};

export async function post({ request }) {
	const cookies = parse(request.headers.get('cookie') || '');
	const requestData = await request.json();

	let userId = null;

	if (typeof cookies.session !== 'undefined' && data.userExists(cookies.session)) {
		userId = cookies.session;
	} else {
		return {
			status: 403
		};
	}

	if (!ajv.validate(schema, requestData)) {
		return {
			status: 400
		};
	}

	let article = data.getArticle(requestData.article);

	let readingData = requestData;

	readingData.user = userId;

	let correctAnswers = 0;

	for (let i = 0; i < article.questions.length; i++) {
		try {
			let question = article.questions[i];
			let answer = readingData.answers[i];
			readingData.answers[i].correctOption = question.correctOption;
			if (answer.answer === question.correctOption) {
				correctAnswers++;
			}
		} catch (e) {
			return {
				status: 400
			};
		}
	}

	let accuracy = correctAnswers / article.questions.length;

	readingData.accuracy = accuracy;

	data.addReading(readingData);

	return {
		status: 200
	};
}
