<script lang="ts">
	import Repos from '$lib/Repos.svelte';
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<svelte:head>
	<title>trendy.dev | {data.title}</title>
	<meta name="description" content="Trending GitHub Repositories and Actions" />
	<meta property="og:image" content="https://trendy.dev/og?language={data.selectedLanguage}"/>

</svelte:head>

<Repos
	title={data.title}
	language={data.selectedLanguage}
	dateRange={data.selectedDateRange}
	languages={data.languages}
	repos={data.repos}
/>
