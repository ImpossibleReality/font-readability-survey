import * as data from '$lib/data';
import { parse, serialize } from 'cookie';

export async function get({ request: { headers } }) {
	const cookies = parse(headers.get('cookie') || '');

	let userId = null;
	if (typeof cookies.session !== 'undefined' && data.userExists(cookies.session)) {
		userId = cookies.session;
	} else {
		userId = data.createNewUser();
	}

	const [article, font] = data.getArticles(userId) || [null, null];

	if (article !== null) data.addUserReading(userId, article.id);

	return {
		body: { article, font },
		headers: {
			'Set-Cookie': serialize('session', userId, {
				path: '/'
			})
		}
	};
}
