<script lang="ts">
    import type {Action} from "./types";

    export let action: Action;

    $: svg = action.svg
        .replace('height="50%"', "")
        .replace('width="50%"', "")

    $: hasIcon = action.svg.indexOf("check-circle") !== 0 && action.svg.indexOf("action") !== 0

    $: href = "https://github.com" + action.url
</script>

<a href={href} class="bg-black block text-white p-4 rounded-lg flex items-start gap-4">
    {#if hasIcon}
        <div class="bg-white p-4 rounded-full flex items-center justify-center">
        <div class="w-8 h-8 text-black">
            {@html svg}
        </div>
        </div>
    {/if}
    <div class="flex-1">
        <h1 class="text-xl">{action.title}</h1>
        <p class="text-gray-200">{action.description}</p>
    </div>
</a>