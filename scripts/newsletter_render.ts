import yargs from 'yargs';
import { readFileSync, writeFileSync } from 'fs';
import { loadSnapshots, getWeeklyTrending, type DiffRepo } from './aggregator.js';

const argv = yargs(process.argv.slice(2))
	.option('snapshots', {
		alias: 's',
		type: 'string',
		description: 'glob pattern to search for snapshots',
		default: 'snapshots/**/*.json',
		demandOption: true
	})
	.option('cache', {
		alias: 'c',
		type: 'string',
		description:
			'where to cache trends (for easier iteration of design without having to re-crunsh data)',
		default: './cache.json',
		demandOption: true
	})
	.parseSync();

const history = async (): Promise<DiffRepo[]> => {
	try {
		const c = readFileSync(argv.cache);
		return JSON.parse(c.toString());
	} catch (e) {
		// Re-crunsh trends
	}

	return loadSnapshots(argv.snapshots).then((repos) => {
		const t = getWeeklyTrending(repos, 300);
		writeFileSync(argv.cache, JSON.stringify(t));
		return t;
	});
};

const bannedKeywords = ['porn'];

const aiKeywords = ['ai', 'ml', 'machine learning', 'diffusion'];

const learningKeywords = ['learning', 'interview', 'education', 'tutorial', 'study', 'roadmap'];

const matchesAnyKeyword = (description: string, keywords: string[]): boolean => {
	for (const kw of keywords) {
		const re = new RegExp(`\\b${kw}\\b`, 'i');
		if (description.match(re)) {
			return true;
		}
	}
	return false;
};

const renderListItem = (h: DiffRepo): string => {
	let res = `<li style="margin-bottom: 6px"><a style="text-decoration: underline; color: #85B8E7;" href="${h.html_url}">${h.full_name}</a>: ${h.description}`;

	if (h.language) {
		res += ` <span style="color: #7C7C7C">(${h.language}, +${h.diff} ⭐️)</a>`;
	} else {
		res += ` <span style="color: #7C7C7C">(+${h.diff} ⭐️)</a>`;
	}

	res += `</li>`;

	return res;
};

const render = (history: DiffRepo[]) => {
	let ai: DiffRepo[] = [];
	let learning: DiffRepo[] = [];
	let projects: DiffRepo[] = [];

	for (const h of history) {
		if (!h.description) {
			continue;
		}
		const desc = h.description.toLowerCase();

		// categorize and filter based on descriptions
		if (matchesAnyKeyword(desc, bannedKeywords)) {
			continue;
		} else if (matchesAnyKeyword(desc, aiKeywords)) {
			ai.push(h);
		} else if (matchesAnyKeyword(desc, learningKeywords)) {
			learning.push(h);
		} else {
			projects.push(h);
		}
	}

	projects = projects.slice(0, 15);
	ai = ai.slice(0, 5);
	learning = learning.slice(0, 3);

	console.log(`<div style="font-family: sans-serif; color: #474747">`);

	console.log(
		`<div style="background-color:#111827; width:100%"><img src="https://trendy.dev/banner-small.png" style="height: 64px" /></div>`
	);

	console.log(`<div style="padding: 8px;">
        <center>
            Welcome! This is issue #1 of <a style="text-decoration: underline; color: #111827;"  href="https://trendy.dev/">Trendy Dev</a> Weekly!
        </center>
    </div>`);

	console.log(`<div style="padding: 8px;">`);

	console.log(`<h2 style="font-family: serif;">Trending Projects</h2>`);
	console.log('<ul>');
	for (const h of projects) {
		console.log(renderListItem(h));
	}
	console.log('</ul>');

	console.log(`<h2 style="font-family: serif;">Trending AI & ML</h2>`);
	console.log('<ul>');
	for (const h of ai) {
		console.log(renderListItem(h));
	}
	console.log('</ul>');

	console.log(`<h2 style="font-family: serif;">Trending Learning</h2>`);
	console.log('<ul>');
	for (const h of learning) {
		console.log(renderListItem(h));
	}
	console.log('</ul>');

	console.log('</div>');
	console.log('</div>');
};

(async () => {
	await history().then(render);
})();
