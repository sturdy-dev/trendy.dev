import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { readFileSync } from 'fs';
import slugify from 'slugify';

const languages = () => {
	const repos = JSON.parse(readFileSync('./src/lib/repos/db.json').toString());
	return Object.keys(repos).map(slugify);
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		preprocess({
			postcss: true,
			typescript: true
		})
	],

	kit: {
		adapter: adapter({
			// edge: true, 
			split: true,
		}),
		prerender: {
			enabled: true,
			crawl: true,
			entries: languages().flatMap((language) => [
				`/top/${language}/`,
				`/day/${language}/`,
				`/week/${language}/`,
				`/month/${language}/`,
			]).concat([
				'/sitemap.xml',
				'/actions',
				'/actions/monthly',
			])
		}
	}
};

export default config;
