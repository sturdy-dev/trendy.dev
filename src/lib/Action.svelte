<script lang="ts">
    import type {Action} from "./types";
    import StarIcon from "$lib/StarIcon.svelte";

    export let action: Action;

    $: svg = action.svg
        .replace('height="50%"', "")
        .replace('width="50%"', "")
    $: hasIcon = action.svg.indexOf("check-circle") !== 0 && action.svg.indexOf("<title>action</title>") !== 0
    $: bg = action.svg.indexOf("action") > 0 ? "bg-blue-500" : "bg-white"
    $: href = "https://github.com" + action.url
</script>

<a href={href} class="bg-black block text-white p-4 rounded-lg flex items-start gap-4">
    {#if hasIcon}
        <div class="{bg} p-4 rounded-full flex items-center justify-center">
        <div class="w-8 h-8 text-black">
            {@html svg}
        </div>
        </div>
    {/if}

    <div class="flex-1">
        <div class="flex items-center justify-between">
        <h1 class="text-xl">{action.title}</h1>
            <div class="text-orange-400 inline-flex gap-2 items-center">
            <StarIcon />
            {action.stars}
            </div>
        </div>
        <p class="text-gray-200">{action.description}</p>
    </div>
</a>