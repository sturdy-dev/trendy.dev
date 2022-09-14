import yargs from 'yargs';
import { createReadStream, writeFileSync } from 'fs';
import readline from 'readline';
import glob from 'glob';
import {
	addDays,
	addMonths,
	addWeeks,
	compareAsc,
	endOfDay,
	isAfter,
	isBefore,
	startOfDay
} from 'date-fns';

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
	fetchedAt: string;
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

export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
	list.reduce((previous, currentItem) => {
		const group = getKey(currentItem);
		if (!previous[group]) previous[group] = [];
		previous[group].push(currentItem);
		return previous;
	}, {} as Record<K, T[]>);

const groupByFullName = (repos: Repo[]) => groupBy(repos, (repo: Repo) => repo.full_name);

const groupByLanguage = (repos: Repo[]) => groupBy(repos, (repo: Repo) => repo.language ?? 'other');

const getTrendingPeriod = (repos: Repo[], [from, to]: [Date, Date]): Repo[] =>
	Array.from(Object.entries(groupByFullName(repos)))
		.flatMap(([_, snapshots]) => {
			const withinRange = snapshots
				.filter((s) => isAfter(new Date(s.fetchedAt), from))
				.filter((s) => isBefore(new Date(s.fetchedAt), to))
				.sort((a, b) => compareAsc(new Date(a.fetchedAt), new Date(b.fetchedAt)));
			if (withinRange.length === 0) return [];
			const earliestSnapshot = withinRange[0];
			const latestSnapshot = withinRange.slice(-1)[0];
			return [
				{
					repo: latestSnapshot,
					starsDiff: latestSnapshot.stargazers_count - earliestSnapshot.stargazers_count
				}
			];
		})
		.sort((a, b) => b.starsDiff - a.starsDiff)
		.map((r) => ({ ...r.repo, diff: r.starsDiff }));

const getTrending = (repos: Repo[], limit: number) => {
	const now = new Date();
	return {
		day: getTrendingPeriod(repos, [startOfDay(addDays(now, -1)), endOfDay(now)]).slice(0, limit),
		week: getTrendingPeriod(repos, [startOfDay(addWeeks(now, -1)), endOfDay(now)]).slice(0, limit),
		month: getTrendingPeriod(repos, [startOfDay(addMonths(now, -1)), endOfDay(now)]).slice(0, limit)
	};
};

const getTop = (repos: Repo[], limit: number) =>
	Array.from(Object.entries(groupByFullName(repos)))
		.map(
			([_, snapshots]) =>
				snapshots.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(-1)[0]
		)
		.sort((a, b) => b.stargazers_count - a.stargazers_count)
		.slice(0, limit);

const limit = 100;

loadSnapshots(argv.snapshots)
	.then((repos) =>
		Object.fromEntries([
			['all', { top: getTop(repos, limit), trending: getTrending(repos, limit) }],
			...Array.from(Object.entries(groupByLanguage(repos))).map(([language, repos]) => [
				language,
				{ top: getTop(repos, limit), trending: getTrending(repos, limit) }
			])
		])
	)
	.then((history) => writeFileSync(argv.output, JSON.stringify(history)));
