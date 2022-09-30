<script lang="ts">
    export let src;
    export let name;
</script>

<a href="/week/{name}" class="block p-4 w-18 h-18 inline-flex flex-col items-center bg-slate-700 text-slate-300 rounded-lg text-center space-y-4 sm:pb-2">
    <img {src} class="h-12" />
    <span class="hidden sm:inline-block">{name}</span>
</a>