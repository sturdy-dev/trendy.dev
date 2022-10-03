import yargs from 'yargs';
import { writeFileSync } from 'fs';
import { loadSnapshots, getTop, getTrending, groupByLanguage } from './aggregator';

const argv = yargs(process.argv.slice(2))
	.option('snapshots', {
		alias: 's',
		type: 'string',
		description: 'glob pattern to search for snapshots',
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
