<script lang="ts">
    import {repos} from "./db/db_repos";
    import RepoItem from './RepoItem.svelte'
    import { type Repository} from "./types";

    export let title;
    export let language;

    const sortByStars = (a: Repository, b: Repository) => b.stars - a.stars

    $: filtered = repos.filter((r) => r.language === language)
    $: sorted = filtered.sort(sortByStars)
</script>

<h1 class="text-2xl text-mono text-center my-4">{title}</h1>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
    {#each sorted as repo, idx}
        <RepoItem {repo} {idx}  />
    {/each}
</div>