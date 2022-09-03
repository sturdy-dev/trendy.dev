<script lang="ts">
    import Actions from '$lib/Actions.svelte';
</script>

<svelte:head>
    <title>trendy.dev | Monthly Trending GitHub Actions</title>
    <meta name="description" content="Monthly Trending GitHub Actions"/>
</svelte:head>

<Actions sortBy="30d" title="Monthly Trending GitHub Actions" />