<script lang="ts">
    import {actions} from "./db";
    import Action from './Action.svelte'
    import Newsletter from "$lib/Newsletter.svelte";

    $: sorted = actions.filter(({stars}) => stars > 0).sort((a: Action, b: Action) => b.stars - a.stars)
</script>

<h1 class="text-2xl text-mono text-center ">Trending GitHub Actions</h1>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
    {#each sorted as action, idx}
        <Action {action} {idx}/>

        {#if idx === 5}
            <Newsletter />
        {/if}
    {/each}
</div>