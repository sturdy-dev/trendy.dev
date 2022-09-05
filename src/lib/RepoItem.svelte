<script lang="ts">
    import type {Repository} from "./types";
    import StarIcon from "$lib/StarIcon.svelte";

    export let repo: Repository;
    export let idx = 1
</script>

<a href={repo.repo_url} class="bg-black block text-white p-4 rounded-lg flex flex-col items-start gap-4 overflow-hidden">
    <div class="flex items-start gap-4 w-full flex-1">

    <div class="flex-1">
        <div class="flex items-baseline gap-2">
        <h1 class="text-xl flex-1">{repo.name}</h1>
            <div class="text-orange-400 inline-flex gap-2 items-center">
            <StarIcon />
            {new Intl.NumberFormat().format(repo.stars)}
            </div>
        </div>
        <p class="text-gray-200 h-full">{repo.description}</p>
    </div>
    </div>

    <span class="text-sm text-gray-400">#{idx+1}</span>
</a>