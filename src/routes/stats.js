import * as data from '$lib/data';
import { parse } from 'cookie';

export async function get({ request: { headers } }) {
	const cookies = parse(headers.get('cookie') || '');

	let userId = null;
	if (typeof cookies.session !== 'undefined' && data.userExists(cookies.session)) {
		userId = cookies.session;
	}

	const readings = data.getReadings();

	let averageAccuracy = null;

	if (readings.length !== 0)
		averageAccuracy = readings.map((r) => r.accuracy).reduce((s, a) => s + a) / readings.length;

	let personalData = null;
	if (userId !== null) {
		personalData = {
			accuracy: null,
			readings: null
		};
		const userReadings = readings.filter((r) => r.user === userId);

		personalData.readings = userReadings.length;

		if (userReadings.length !== 0) {
			personalData.accuracy =
				userReadings.map((r) => r.accuracy).reduce((s, a) => s + a) / userReadings.length;
		}
	}

	return {
		body: {
			users: data.getUserCount(),
			readings: data.getReadingsCount(),
			articles: data.getArticlesCount(),
			accuracy: averageAccuracy,
			personal: personalData
		}
	};
}
