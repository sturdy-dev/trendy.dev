<script lang="ts">
    import Actions from '$lib/Actions.svelte';
</script>

<svelte:head>
    <title>trendy.dev | Trending GitHub Actions</title>
    <meta name="description" content="Trending GitHub Actions"/>
</svelte:head>

<div class="flex justify-around bg-gray-900 w-full min-h-screen">
    <div class="max-w-7xl flex-1 text-white">
        <header class="text-2xl p-2 font-mono flex items-center gap-4">
            <img src="/laptop-small.png" class="h-16 w-16"/>
            trendy.dev
        </header>

        <Actions/>
    </div>
</div>