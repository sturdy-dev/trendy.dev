<script lang="ts">
    import type {Action} from "./types";
    import StarIcon from "$lib/StarIcon.svelte";

    export let action: Action;
    export let idx = 1
    export let show: "total" | "30d" | "7d" = "total"

    $: description = action.description.replace(/\s/g, " ");

    $: svg = action.svg
        .replace('height="50%"', "")
        .replace('width="50%"', "")
        .replace(`style="color: #ffffff;`, 'style="color:#374151;')
        .replace(`style="`, 'style="margin: auto auto; height: 100%; width: 100%; ')
    $: hasIcon = action.svg.indexOf("check-circle") !== 0 && action.svg.indexOf("<title>action</title>") !== 0
    $: bg = action.svg.indexOf("<title>action") > 0 ? "bg-blue-500" : "bg-white"
    $: href = action.repo_url ?? "https://github.com" + action.url
    $: stars = show === "total" ? action.stars : action.trend30d
</script>

<a href={href} class="bg-black block text-white p-4 rounded-lg flex flex-col items-start gap-4 overflow-hidden">
    <div class="flex items-start gap-4 w-full flex-1">

    {#if hasIcon}
        <div class="{bg} p-2 rounded-md flex items-center justify-center">
        <div class="w-8 h-8 text-black">
            {@html svg}
        </div>
        </div>
    {/if}

    <div class="flex-1">
        <div class="flex items-baseline gap-2">
        <h1 class="text-xl flex-1">{action.title}</h1>
            <div class="text-orange-400 inline-flex gap-2 items-center">
            <StarIcon />
            {stars}
            </div>
        </div>
        <p class="text-gray-200 h-full">{description}</p>
    </div>
    </div>

    <span class="text-sm text-gray-400">#{idx+1}</span>
</a>