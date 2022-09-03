<script lang="ts">
    import {actions} from "./db";
    import ActionItem from './ActionItem.svelte'
    import Newsletter from "$lib/Newsletter.svelte";
    import {type Action} from "./types";

    export let sortBy: "total" | "30d" | "7d" = "total"
    export let title;

    const trend = (a: Action): number => {
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

    $: filtered = actions
        .filter(({stars}) => stars > 0)
        .map((a) => {
            a.trend30d = trend(a)
            return a
        })
        .filter((a: Action) => {
            if (sortBy === "30d") {
                return a.trend30d > 5
            }
            return a.stars >= 10
        })


    const sortTotal = (a: Action, b: Action) => b.stars - a.stars
    const sort30d = (a: Action, b: Action) => b.trend30d - a.trend30d

    $: sortFun = sortBy === "total" ? sortTotal : sort30d
    $: sorted = filtered.sort(sortFun)
</script>

<h1 class="text-2xl text-mono text-center">{title}</h1>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
    {#each sorted as action, idx}
        <ActionItem {action} {idx} show={sortBy} />

        {#if idx === 5}
            <Newsletter/>
        {/if}
    {/each}
</div>