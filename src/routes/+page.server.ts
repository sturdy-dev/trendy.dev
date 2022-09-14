import type { PageServerLoad } from './$types';
import { day, languages } from '$lib/repos';
import { redirect } from '@sveltejs/kit';

export const prerender = false;

export const load: PageServerLoad = async ({ url }) => {
	const dateRange = url.searchParams.get('date-range');
	const language = url.searchParams.get('language');
	if (dateRange || language) {
		throw redirect(303, `/repos/${dateRange ?? 'day'}/${language ?? 'all'}`);
	}
	return {
		selectedLanguage: 'all',
		selectedDateRange: 'day',
		languages,
		title: 'Daily trending repositories',
		repos: day('all')
	};
};
