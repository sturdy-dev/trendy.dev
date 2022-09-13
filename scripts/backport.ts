import yargs from 'yargs';
import { createReadStream, createWriteStream } from 'fs';
import readline from 'readline';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import {
	addDays,
	compareDesc,
	formatDistanceToNowStrict,
	formatISO9075,
	isSameDay,
	startOfDay,
	format
} from 'date-fns';
import { basename, join } from 'path';

const argv = yargs(process.argv.slice(2))
	.option('token', {
		alias: 't',
		type: 'string',
		description: 'github api token to use',
		demandOption: false
	})
	.option('from', {
		alias: 'f',
		type: 'string',
		description: 'date to fetch stars from',
		default: '2022-08-09T00:00:00Z',
		demandOption: true
	})
	.option('snapshot', {
		alias: 's',
		type: 'string',
		description: 'path to the snapshot to fetch repo names from',
		demandOption: true
	})
	.option('output', {
		alias: 'o',
		type: 'string',
		description: 'dir path to store snapshots',
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
			repos.push({ ...repo, fetchedAt: repo.fetchedAt ?? new Date().toISOString() });
		});
		lineReader.on('close', () => resolve(repos));
		lineReader.on('error', (e) => reject(e));
	});
};

const onRateLimit = (retryAfter: number) => {
	console.info(`request quota exhausted, retrying after ${retryAfter} seconds!`);
	return true;
};

const onSecondaryRateLimit = onRateLimit;

const ThrottledOctokit = Octokit.plugin(throttling);
const octokit = new ThrottledOctokit({
	auth: argv.token === '' ? undefined : argv.token,
	throttle: { onRateLimit, onSecondaryRateLimit }
});

const listStargazers = (fullName: string, page?: number) =>
	octokit.activity
		.listStargazersForRepo({
			headers: {
				accept: 'application/vnd.github.v3.star+json'
			},
			owner: fullName.split('/')[0],
			repo: fullName.split('/')[1],
			per_page: 100,
			page
		})
		.then((r) => r.data)
		.catch((e) => {
			if (e.status === 422) return [];
			console.error(e);
			return [];
		});

const listStarDatesForRepoFrom = async (
	full_name: string,
	page: number,
	from: Date
): Promise<Date[]> => {
	const stargazers = await listStargazers(full_name, page);
	if (stargazers.length === 0) {
		console.log(`${full_name}: 0 stargezers at page ${page}, stopping`);
		return [];
	}

	const dates = stargazers.map((s) => s!.starred_at).map((d) => new Date(d!));
	const minDate = dates.reduce(
		(min, date) => (date.getTime() < min.getTime() ? date : min),
		dates[0]
	);

	if (from.getTime() >= minDate.getTime()) {
		console.log(
			`${full_name}: ${stargazers.length} stargezers at page ${page}, minDate ${formatISO9075(
				minDate,
				{ format: 'basic', representation: 'date' }
			)}, stopping`
		);
		return dates;
	}

	if (page === 1) {
		console.log(`${full_name}: ${stargazers.length} stargezers at page ${page}, stopping`);
		return dates;
	}

	console.log(
		`${full_name}: ${stargazers.length} stargezers at page ${page}, minDate ${formatISO9075(
			minDate,
			{ format: 'basic', representation: 'date' }
		)}, continuing to page ${page - 1}`
	);

	return [...dates, ...(await listStarDatesForRepoFrom(full_name, page - 1, from))];
};

const listStarDatesForRepo = async (repo: Repo, from: Date) => {
	const totalPages = Math.ceil(repo.stargazers_count / 100);
	console.log(`${repo.full_name}: latest stargazers ${repo.stargazers_count}, ${totalPages} pages`);
	const starsDates = await listStarDatesForRepoFrom(repo.full_name, totalPages, from);
	return starsDates;
};

const range = (from: Date, to: Date) => {
	const dates: Date[] = [];
	for (let date = from; !isSameDay(date.getTime(), to.getTime()); date = addDays(date, 1)) {
		dates.push(date);
	}
	return dates;
};

const getDailySnapshots = async (repo: Repo, from: Date) => {
	console.log(`${repo.full_name}: making snapshots`);
	const starsDates = await listStarDatesForRepo(repo, new Date(argv.from));
	if (starsDates.length === 0) return [{ ...repo }];
	console.log(`${repo.full_name}: found ${starsDates.length} stars`);
	const snapshotDates = range(from, new Date(repo.fetchedAt));
	return snapshotDates.sort(compareDesc).map((date) => {
		const starsDiff = starsDates.filter(
			(d) => startOfDay(d).getTime() > startOfDay(date).getTime()
		).length;
		return {
			...repo,
			stargazers_count: repo.stargazers_count - starsDiff,
			fetchedAt: date.toISOString()
		};
	});
};

const groupByFetchedAtDate = (repos: Repo[]) =>
	repos.reduce((byFetchedAt, repo) => {
		const date = startOfDay(new Date(repo.fetchedAt)).getTime();
		const existing = byFetchedAt.get(date) ?? [];
		byFetchedAt.set(date, [...existing, repo]);
		return byFetchedAt;
	}, new Map<number, Repo[]>());

const startedAt = new Date();

const rangeFrom = addDays(new Date(argv.from), -1);
const rangeTo = new Date(basename(argv.snapshot).split('.')[0]);

const getFilenameForDate = (date: Date | number) =>
	join(argv.output, `${format(date, 'uuuu-MM-dd')}.json`);

const loadFetched = () =>
	Promise.all(
		range(rangeFrom, rangeTo)
			.map(getFilenameForDate)
			.map((path) => loadSnapshot(path).catch(() => []))
	).then((rr) => rr.flatMap((r) => r));

Promise.all([loadSnapshot(argv.snapshot), loadFetched()])
	.then(([toFetch, fetched]) => {
		const fetchedSet = new Set<string>(fetched.map((f) => f.full_name));
		return toFetch.filter((r) => !fetchedSet.has(r.full_name));
	})
	.then(async (repos) => {
		let i = 0;
		for (const repo of repos) {
			i++;
			await getDailySnapshots(repo, rangeFrom)
				.then(groupByFetchedAtDate)
				.then((byFetchedAt) =>
					Array.from(byFetchedAt.entries()).forEach(([date, repos]) => {
						const filename = getFilenameForDate(date);
						const stream = createWriteStream(filename, { flags: 'a' });
						for (const repo of repos) {
							stream.write(JSON.stringify(repo) + '\n');
						}
						stream.close();
					})
				);
			console.log(
				`done ${i}/${repos.length} (${((i / repos.length) * 100).toFixed(
					2
				)}%) in ${formatDistanceToNowStrict(startedAt, { unit: 'second' })}`
			);
		}
	});
