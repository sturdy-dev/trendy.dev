<script lang="ts">
    import Repos from '$lib/Repos.svelte';
</script>

<svelte:head>
    <title>trendy.dev | Trending GitHub Repositories and Actions</title>
    <meta name="description" content="Trending GitHub Repositories and Actions"/>
</svelte:head>

<div class="flex items-center gap-4 justify-center">
    <a class="text-gray-400 hover:text-gray-300" href="/actions/monthly">Actions</a>
    <a class="text-gray-400 hover:text-gray-300" href="/go/weekly">Go</a>
    <a class="text-gray-400 hover:text-gray-300" href="/typescript/weekly">TypeScript</a>
</div>

<Repos title="Weekly Trending Repositories" sortBy="7d"/>