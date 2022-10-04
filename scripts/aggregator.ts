import { createReadStream } from 'fs';
import readline from 'readline';
import glob from 'glob';
import {
    addDays,
    addMonths,
    addWeeks,
    compareAsc,
    differenceInMonths,
    endOfDay,
    isAfter,
    isBefore,
} from 'date-fns';

export type Repo = {
    full_name: string;
    html_url: string;
    description: string | null;
    updated_at: string;
    stargazers_count: number;
    language: string | null;
    fetchedAt: string;
};

type starsDiffer = {
    diff: number;
}

type DiffRepo = Repo & starsDiffer

export const loadSnapshot = async (path: string): Promise<Repo[]> => {
    return new Promise((resolve, reject) => {
        const stream = createReadStream(path, { flags: 'r' });
        const lineReader = readline.createInterface({
            input: stream
        });
        const repos: Repo[] = [];
        lineReader.on('line', (line: string) => {
            const repo = JSON.parse(line) as Repo;
            // Only save repos fetched within the last month
            if (differenceInMonths(new Date(repo.fetchedAt), new Date()) === 0) {
                repos.push(repo);
            }
        });
        lineReader.on('close', () => resolve(repos));
        lineReader.on('error', (e) => reject(e));
    });
};

export const loadSnapshots = async (path: string): Promise<Repo[]> => {
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

export const groupByFullName = (repos: Repo[]) => groupBy(repos, (repo: Repo) => repo.full_name);

export const groupByLanguage = (repos: Repo[]) => groupBy(repos, (repo: Repo) => repo.language ?? 'other');

const showRepo = (repo: Repo): boolean => {
    // Hide repositories with a low signal/noice ratio
    if (repo.description?.match(/\p{Script=Han}/u)) {
        return false
    }
    return true
}

export const getTrendingPeriod = (repos: Repo[], [from, to]: [Date, Date], hours: number): DiffRepo[] => {
    return Array.from(Object.entries(groupByFullName(repos)))
        .flatMap(([_, snapshots]): { repo: Repo, starsDiff: number }[] => {
            const beforeFrom = snapshots
                .filter((s) => isBefore(new Date(s.fetchedAt), from))
                .sort((a, b) => compareAsc(new Date(a.fetchedAt), new Date(b.fetchedAt)))

            const beforeToAfterFrom = snapshots
                .filter((s) => isBefore(new Date(s.fetchedAt), to))
                .filter((s) => isAfter(new Date(s.fetchedAt), from))
                .sort((a, b) => compareAsc(new Date(a.fetchedAt), new Date(b.fetchedAt)))


            let earliestSnapshot: Repo | undefined
            let latestSnapshot: Repo | undefined

            if (beforeFrom.length > 0 && beforeToAfterFrom.length > 0) {
                earliestSnapshot = beforeFrom.slice(-1)[0];
                latestSnapshot = beforeToAfterFrom.slice(-1)[0];
            } else if (beforeToAfterFrom.length > 1) {
                earliestSnapshot = beforeToAfterFrom[0];
                latestSnapshot = beforeToAfterFrom.slice(-1)[0];
            } else {
                return []
            }

            if (!showRepo(latestSnapshot)) {
                return []
            }

            let starsDiff = latestSnapshot.stargazers_count - earliestSnapshot.stargazers_count;

            // When calculating the delta for a period that we don't have resolution for.
            // time between snapshots, used to scale delta to the desired range
            const diffHours = (new Date(latestSnapshot.fetchedAt).getTime() - new Date(earliestSnapshot.fetchedAt).getTime()) / 1000 / 60 / 60;
            if (diffHours > hours) {
                starsDiff = Math.ceil((latestSnapshot.stargazers_count - earliestSnapshot.stargazers_count) / diffHours * hours)
            }

            return [
                {
                    repo: latestSnapshot,
                    starsDiff,
                }
            ];
        })
        .sort((a, b) => b.starsDiff - a.starsDiff)
        .filter((r) => r.starsDiff > 0)
        .map((r): DiffRepo => ({ ...r.repo, diff: r.starsDiff }));
}

export const getTrending = (repos: Repo[], limit: number) => {
    const now = new Date();
    return {
        day: getTrendingPeriod(repos, [endOfDay(addDays(now, -1)), endOfDay(now)], 24).slice(0, limit),
        week: getTrendingPeriod(repos, [endOfDay(addWeeks(now, -1)), endOfDay(now)], 24 * 7).slice(0, limit),
        month: getTrendingPeriod(repos, [endOfDay(addMonths(now, -1)), endOfDay(now)], 24 * 31).slice(0, limit)
    };
};

export const getTop = (repos: Repo[], limit: number) =>
    Array.from(Object.entries(groupByFullName(repos)))
        .map(
            ([_, snapshots]) =>
                snapshots.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(-1)[0]
        )
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .filter(showRepo)
        .filter((r) => r.stargazers_count > 0)
        .slice(0, limit);