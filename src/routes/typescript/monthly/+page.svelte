<script lang="ts">
    import Repos from '$lib/Repos.svelte';
</script>

<svelte:head>
    <title>trendy.dev | Trending TypeScript Repositories</title>
    <meta name="description" content="Trending TypeScript Repositories"/>
</svelte:head>

<Repos title="Trending TypeScript Repositories" language="typescript" sortBy="30d" />