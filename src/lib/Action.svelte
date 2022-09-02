<script lang="ts">
    import type {Action} from "./types";

    export let action: Action;
</script>

<div class="bg-black text-white border-2 border-sky-200 p-4 rounded-md flex items-start gap-4">
    <div class="bg-white rounded-full p-4 overflow-hidden">
        <svg class="w-8 h-8">{@html action.svg}</svg>
    </div>
    <div class="flex-1">
        <h1 class="text-xl">{action.title}</h1>
        <p class="text-gray-200">{action.description}</p>
    </div>
</div>