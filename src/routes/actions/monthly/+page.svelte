<script lang="ts">
    import Actions from '$lib/Actions.svelte';
</script>

<svelte:head>
    <title>Monthly Trending GitHub Actions</title>
    <meta name="description" content="Monthly Trending GitHub Actions"/>
    <meta property="og:image" content="https://trendy.dev/og?language=Actions"/>
</svelte:head>

<Actions sortBy="30d" title="Monthly Trending GitHub Actions" />