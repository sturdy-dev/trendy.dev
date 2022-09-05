<script lang="ts">
    import Repos from '$lib/Repos.svelte';
</script>

<svelte:head>
    <title>trendy.dev | Weekly Trending Go Repositories</title>
    <meta name="description" content="Weekly Trending Go Repositories"/>
</svelte:head>

<Repos title="Weekly Trending Go Repositories" language="go" sortBy="7d" />