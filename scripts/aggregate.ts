import yargs from 'yargs';
import { createReadStream, writeFileSync } from 'fs';
import readline from 'readline';
import glob from 'glob';

const argv = yargs(process.argv.slice(2))
	.option('snapshots', {
		alias: 's',
		type: 'string',
		description: 'glob pattern to search for sapshots',
		default: 'snapshots/**/*.json',
		demandOption: true
	})
	.option('output', {
		alias: 'o',
		type: 'string',
		description: 'file path to write results to',
		default: 'aggregated.json',
		demandOption: true
	})
	.parseSync();

type Repo = {
	full_name: string;
	html_url: string;
	description: string | null;
	updated_at: string;
	stargazers_count: number;
	language: string | null;
	fetchedAt: number;
};

const loadSnapshot = async (path: string): Promise<Repo[]> => {
	return new Promise((resolve, reject) => {
		const stream = createReadStream(path, { flags: 'r' });
		const lineReader = readline.createInterface({
			input: stream
		});
		const repos: Repo[] = [];
		lineReader.on('line', (line: string) => {
			const repo = JSON.parse(line) as Repo;
			repos.push(repo);
		});
		lineReader.on('close', () => resolve(repos));
		lineReader.on('error', (e) => reject(e));
	});
};

const loadSnapshots = async (path: string): Promise<Repo[]> => {
	return new Promise((resolve, reject) =>
		glob(path, (e, files) => {
			if (e) {
				reject(e);
			} else {
				Promise.all(files.map(loadSnapshot))
					.then((snapshots) => snapshots.flatMap((s) => s))
					.then((repos) => resolve(repos));
			}
		})
	);
};

const groupByFullName = async (repos: Repo[]) =>
	repos.reduce((byFullName, repo) => {
		const existing = byFullName.get(repo.full_name) ?? [];
		byFullName.set(repo.full_name, [...existing, repo]);
		return byFullName;
	}, new Map<string, Repo[]>());

const toHistory = (repos: Repo[]) => ({
	name: repos[0].full_name,
	descriptions: repos[0].description,
	stars: repos.reduce(
		(max, item) => (item.stargazers_count > max ? item.stargazers_count : max),
		repos[0].stargazers_count
	),
	language: repos[0].language,
	repo_url: repos[0].html_url,
	stars_history: repos.map(({ fetchedAt, stargazers_count }) => ({
		at: new Date(fetchedAt).toUTCString(),
		count: stargazers_count
	}))
});

loadSnapshots(argv.snapshots)
	.then(groupByFullName)
	.then((byFullName) => Array.from(byFullName.entries()).map(([_, repos]) => toHistory(repos)))
	.then((history) => writeFileSync(argv.output, JSON.stringify(history)));
