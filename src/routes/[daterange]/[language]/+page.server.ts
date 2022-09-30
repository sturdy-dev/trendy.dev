import type { PageServerLoad } from './$types';
import { languages, top, month, week, day, unslugify, fallback } from '$lib/repos';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const dateRange = params.daterange;
	const selector =
		dateRange === 'day' ? day : dateRange === 'week' ? week : dateRange === 'month' ? month : top;
	const languageSlug = params.language;
	const unsluggedLanguage = unslugify(languageSlug);
	const language = unsluggedLanguage ?? 'all';

	// Language slug is specified, but no match was found
	if (languageSlug && !unsluggedLanguage) {
		// best effort find a match (eg redirect "swift" -> "Swift")
		const fb = fallback(languageSlug);
		if (fb) {
			throw redirect(303, `/${dateRange ?? 'day'}/${fb.title}`);
		}

		// redirect to all
		throw redirect(302, `/${dateRange ?? 'day'}/all`);
	}

	const title = [
		dateRange === 'day'
			? 'Daily trending'
			: dateRange === 'week'
			? 'Weekly trending'
			: dateRange === 'month'
			? 'Monthly trending'
			: 'Top',
		...(language === 'all' ? [] : [language]),
		'repositories'
	].join(' ');

	return {
		selectedLanguage: languageSlug,
		selectedDateRange: dateRange,
		languages,
		title,
		repos: selector(language)
	};
};
