<script lang="ts">
    import Repos from '$lib/Repos.svelte';
</script>

<svelte:head>
    <title>trendy.dev | Trending Go Repositories</title>
    <meta name="description" content="Trending Go Repositories"/>
</svelte:head>

<Repos title="Trending Go Repositories" language="go" sortBy="30d" />