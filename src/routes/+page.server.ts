import type { PageServerLoad } from './$types';
import { languages, top, month, week, day, unslugify } from '$lib/repos';

export const load: PageServerLoad = async ({ url }) => {
	const dateRange = url.searchParams.get('date-range') ?? 'day';
	const selector =
		dateRange === 'day' ? day : dateRange === 'week' ? week : dateRange === 'month' ? month : top;
	const languageSlug = url.searchParams.get('language') ?? 'all';
	const language = unslugify(languageSlug) ?? 'all';

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
