<script lang="ts">
	import Repos from '$lib/Repos.svelte';
	import type { PageData } from './$types';
	import Navigator from "$lib/navigator/Navigator.svelte";
	export let data: PageData;
</script>

<svelte:head>
	<title>trendy.dev | {data.title}</title>
	<meta name="description" content="Trending GitHub Repositories and Actions" />
</svelte:head>

<Navigator />

<Repos
	title={data.title}
	language={data.selectedLanguage}
	dateRange={data.selectedDateRange}
	languages={data.languages}
	repos={data.repos}
/>
