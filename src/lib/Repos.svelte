<script lang="ts">
    import {repos} from "./db/db_repos";
    import RepoItem from './RepoItem.svelte'
    import { type Repository} from "./types";

    export let title;
    export let language;
    export let sortBy: "total" | "30d"  = "total"

    const trend = (a: Repository): number => {
        if (!a.stars_history) {
            return -1
        }

        // Get a date object for the current time
        const d30 = new Date();
        d30.setMonth(d30.getMonth() - 1);
        d30.setHours(0, 0, 0, 0);

        for (const h of a.stars_history) {
            const ts = new Date(h.at)
            if (ts > d30) {
                return a.stars - h.count
            }
        }

        return -1
    }

    $: filtered = repos
        .filter(({stars}) => stars > 0)
        .filter((r) => r.language === language)
        .map((a) => {
            a.trend30d = trend(a)
            return a
        })
        .filter((a: Repository) => {
            if (sortBy === "30d") {
                return a.trend30d > 5
            }
            return a.stars >= 10
        })


    const sortTotal = (a: Repository, b: Repository) => b.stars - a.stars
    const sort30d = (a: Repository, b: Repository) => b.trend30d - a.trend30d

    $: sortFun = sortBy === "total" ? sortTotal : sort30d
    $: sorted = filtered.sort(sortFun).slice(0, 100)
</script>

<h1 class="text-2xl text-mono text-center my-4">{title}</h1>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
    {#each sorted as repo, idx}
        <RepoItem {repo} {idx} show={sortBy} />
    {/each}
</div>