import repos from './db.json';
import slugify from 'slugify';

type Repo = {
	full_name: string;
	description: string;
	stargazers_count: number;
	html_url: string;
	language: string;
	diff?: number;
};

const all = repos as Record<
	string | 'all' | 'other',
	{
		top: Repo[];
		trending: {
			day: Repo[];
			week: Repo[];
			month: Repo[];
		};
	}
>;

export const languages = Object.keys(all).map((language) => ({
	title: language,
	slug: slugify(language)
}));

export const unslugify = (slug: string) => languages.find((ls) => ls.slug === slug)?.title;

export const top = (language: string) => all[language].top;
export const day = (language: string) => all[language].trending.day;
export const week = (language: string) => all[language].trending.week;
export const month = (language: string) => all[language].trending.month;
