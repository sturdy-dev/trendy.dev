import yargs from 'yargs';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { writeFileSync } from 'fs';

const argv = yargs(process.argv.slice(2))
	.option('output', {
		alias: 'o',
		type: 'string',
		description: 'file path to write results to',
		default: 'results.json',
		demandOption: true
	})
	.parseSync();

const onRateLimit = (retryAfter: number) => {
	console.info(`request quota exhausted, retrying after ${retryAfter} seconds!`);
	return true;
};

const onSecondaryRateLimit = onRateLimit;

const ThrottledOctokit = Octokit.plugin(throttling);
const octokit = new ThrottledOctokit({
	throttle: { onRateLimit, onSecondaryRateLimit }
});

octokit.hook.before('request', async (options) => {
	const url = new URL(options.url);
	const params = Object.fromEntries(Array.from(url.searchParams.entries()));
	console.log('requesting', { ...params });
});

type Repo = {
	full_name: string;
	html_url: string;
	description: string | null;
	updated_at: string;
	stargazers_count: number;
	language: string | null;
};

const batch = (stars_gte: number): Promise<Repo[]> =>
	octokit
		.paginate(octokit.search.repos, {
			q: `fork:false is:public archived:false stars:>=${stars_gte}`,
			sort: 'stars',
			order: 'desc',
			per_page: 100
		})
		.then((repos) =>
			repos.map(({ full_name, html_url, description, updated_at, stargazers_count, language }) => ({
				full_name,
				html_url,
				description,
				updated_at,
				stargazers_count,
				language
			}))
		);

const uniq = (repos: Repo[]) =>
	repos
		.sort((a, b) => a.full_name.localeCompare(b.full_name))
		.filter((item, pos, arr) => !pos || item !== arr[pos - 1]);

const fetchAll = (min_stars: number): Promise<Repo[]> =>
	batch(min_stars).then((page) => {
		if (page.length === 0) return [];
		const maxStars = page.reduce(
			(max, item) => (item.stargazers_count > max ? item.stargazers_count : max),
			page[0].stargazers_count
		);
		return fetchAll(maxStars).then((nextPage) => uniq(page.concat(nextPage)));
	});

fetchAll(100).then((all: any[]) => writeFileSync(argv.output, JSON.stringify(all)));
