<script lang="ts">
    import Repos from '$lib/Repos.svelte';
</script>

<svelte:head>
    <title>trendy.dev | Weekly Trending TypeScript Repositories</title>
    <meta name="description" content="Weekly Trending TypeScript Repositories"/>
</svelte:head>

<Repos title="Weekly Trending TypeScript Repositories" language="typescript" sortBy="7d" />