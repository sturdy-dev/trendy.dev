import yargs from 'yargs';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';
import { createWriteStream, createReadStream } from 'fs';
import readline from 'readline';

const argv = yargs(process.argv.slice(2))
	.option('token', {
		alias: 't',
		type: 'string',
		description: 'github api token to use',
		demandOption: false
	})
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

const MyOctokit = Octokit.plugin(throttling, retry);
const octokit = new MyOctokit({
	auth: argv.token === '' ? undefined : argv.token,
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
	fetchedAt: string;
};

const batch = (stars_gte: number): Promise<Repo[]> =>
	octokit
		.paginate(octokit.search.repos, {
			q: `fork:false is:public archived:false stars:>=${stars_gte}`,
			sort: 'stars',
			order: 'asc',
			per_page: 100
		})
		.then((repos) =>
			repos.map(({ full_name, html_url, description, updated_at, stargazers_count, language }) => ({
				full_name,
				html_url,
				description,
				updated_at,
				stargazers_count,
				language,
				fetchedAt: new Date().toISOString()
			}))
		);

const getMaxStars = (repos: Repo[]): number =>
	repos.length === 0
		? 0
		: repos.reduce(
				(max, item) => (item.stargazers_count > max ? item.stargazers_count : max),
				repos[0].stargazers_count
		  );

async function* fetchRepos(min_stars: number) {
	let stars = min_stars;
	while (true) {
		const page = await batch(stars);
		for (const item of page) {
			yield item;
		}
		if (page.length < 1000) return;
		const maxStars = getMaxStars(page);
		stars = maxStars;
	}
}

const maxFetched = async (path: string): Promise<number> => {
	return new Promise((resolve, reject) => {
		const stream = createReadStream(path, { flags: 'r' });
		const lineReader = readline.createInterface({
			input: stream
		});
		let maxStars = 0;
		lineReader.on('line', (line: string) => {
			const repo = JSON.parse(line) as Repo;
			if (repo.stargazers_count > maxStars) {
				maxStars = repo.stargazers_count;
			}
		});
		lineReader.on('close', () => resolve(maxStars));
		lineReader.on('error', (e) => reject(e));
	});
};

(async () => {
	const from = await maxFetched(argv.output)
		.then((c) => (c === 0 ? 100 : c))
		.catch(() => 100);
	const stream = createWriteStream(argv.output, { flags: 'a' });
	for await (const repo of fetchRepos(from)) {
		stream.write(JSON.stringify(repo) + '\n');
	}
})();
