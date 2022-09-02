<script lang="ts">
    import {actions} from "./db";
    import Action from './Action.svelte'
</script>

<div class="grid grid-cols-2 gap-4">
    {#each actions as action}
        <Action {action}/>
    {/each}
</div>