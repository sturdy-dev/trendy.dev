<script lang="ts">
    import {repos} from "./db/db_repos";
    import RepoItem from './RepoItem.svelte'
    import {type Repository} from "./types";

    export let title;
    export let language;
    export let sortBy: "total" | "30d" | "7d" = "total"

    const getCut = () => {
        // Get a date object for the current time
        const cut = new Date();
        if (sortBy === "30d") {
            cut.setMonth(cut.getMonth() - 1);
        } else if (sortBy === "7d") {
            cut.setDate(cut.getDate() - 7);
        }
        cut.setHours(0, 0, 0, 0);

        return cut
    }

    $: cut = getCut()

    const trend = (a: Repository): number => {
        if (!a.stars_history) {
            return -1
        }

        for (const h of a.stars_history) {
            const ts = new Date(h.at)
            if (ts > cut) {
                return a.stars - h.count
            }
        }

        return -1
    }

    $: filtered = repos
        .filter(({stars}) => stars > 0)
        .filter((r) => !language || r.language === language)
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

{#if language}
<div class="flex items-center gap-4 justify-center">
    <a class="text-gray-400 hover:text-gray-300" href="/{language}" class:text-red-800={sortBy === "total"}>Toplist</a>
    <a class="text-gray-400 hover:text-gray-300" href="/{language}/monthly" class:text-red-800={sortBy === "30d"}>Monthly Trending</a>
    <a class="text-gray-400 hover:text-gray-300" href="/{language}/weekly" class:text-red-800={sortBy === "7d"}>Weekly Trending</a>
</div>
    {/if}

<h1 class="text-2xl text-mono text-center my-4">{title}</h1>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
    {#each sorted as repo, idx}
        <RepoItem {repo} {idx} show={sortBy}/>
    {/each}
</div>